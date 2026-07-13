import { Router } from "express";
import { db, discordGrantsTable } from "../db.js";
import { eq, and, gt, lt } from "drizzle-orm";
import { addRole, removeRole } from "../lib/discord.js";
import { logger } from "../lib/logger.js";

const router = Router();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const ACCESS_DURATION_HOURS = parseInt(process.env.ACCESS_DURATION_HOURS ?? "1", 10);

if (!CLIENT_ID) throw new Error("DISCORD_CLIENT_ID is required");
if (!CLIENT_SECRET) throw new Error("DISCORD_CLIENT_SECRET is required");

function getRedirectUri(req) {
  const proto =
    req.headers["x-forwarded-proto"]?.split(",")[0]?.trim() ??
    req.protocol ??
    "https";
  const host =
    req.headers["x-forwarded-host"] ??
    req.headers.host ??
    process.env.REPLIT_DEV_DOMAIN;
  return `${proto}://${host}/api/callback`;
}

// GET /api/auth/discord — start OAuth flow
router.get("/auth/discord", (req, res) => {
  const state = Math.random().toString(36).slice(2);
  req.session.oauthState = state;

  const redirectUri = getRedirectUri(req);
  logger.info({ redirectUri }, "Starting Discord OAuth");

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify",
    state,
  });

  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

// GET /api/callback — OAuth callback
router.get("/callback", async (req, res) => {
  const { code, state } = req.query;
  const storedState = req.session.oauthState;

  if (!code || !state || state !== storedState) {
    logger.warn({ state, storedState }, "OAuth state mismatch");
    return res.redirect("/?error=state_mismatch");
  }

  delete req.session.oauthState;

  const redirectUri = getRedirectUri(req);

  try {
    // Exchange code for token
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      logger.error({ err }, "Failed to exchange Discord code for token");
      return res.redirect("/?error=token_exchange_failed");
    }

    const tokenData = await tokenRes.json();

    // Fetch user info
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      logger.error("Failed to fetch Discord user info");
      return res.redirect("/?error=user_fetch_failed");
    }

    const user = await userRes.json();
    const discordId = user.id;
    const discordUsername = user.global_name ?? user.username;

    // Check for existing active grant
    const now = new Date();
    const existing = await db
      .select()
      .from(discordGrantsTable)
      .where(
        and(
          eq(discordGrantsTable.discordId, discordId),
          eq(discordGrantsTable.isExpired, false),
          gt(discordGrantsTable.expiresAt, now)
        )
      )
      .limit(1);

    let expiresAt;

    if (existing.length > 0) {
      expiresAt = existing[0].expiresAt;
      logger.info({ discordId }, "User already has active grant");
    } else {
      expiresAt = new Date(now.getTime() + ACCESS_DURATION_HOURS * 60 * 60 * 1000);

      // Mark old records expired
      await db
        .update(discordGrantsTable)
        .set({ isExpired: true })
        .where(eq(discordGrantsTable.discordId, discordId));

      try {
        await addRole(discordId);
      } catch (roleErr) {
        logger.error({ roleErr, discordId }, "Failed to add role");
        return res.redirect(`/?error=role_grant_failed&username=${encodeURIComponent(discordUsername)}`);
      }

      await db.insert(discordGrantsTable).values({
        discordId,
        discordUsername,
        expiresAt,
      });

      logger.info({ discordId, discordUsername, expiresAt }, "New grant created");
    }

    const params = new URLSearchParams({
      username: discordUsername,
      expires_at: expiresAt.toISOString(),
      hours: String(ACCESS_DURATION_HOURS),
    });
    res.redirect(`/success?${params}`);
  } catch (err) {
    logger.error({ err }, "Error in OAuth callback");
    res.redirect("/?error=internal_error");
  }
});

// GET /api/discord/status
router.get("/discord/status", async (req, res) => {
  const { discord_id } = req.query;
  if (!discord_id) return res.json({ hasActiveGrant: false });

  const now = new Date();
  const grants = await db
    .select()
    .from(discordGrantsTable)
    .where(
      and(
        eq(discordGrantsTable.discordId, discord_id),
        eq(discordGrantsTable.isExpired, false),
        gt(discordGrantsTable.expiresAt, now)
      )
    )
    .limit(1);

  if (grants.length === 0) return res.json({ hasActiveGrant: false });

  const grant = grants[0];
  const hoursRemaining = (grant.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  res.json({
    hasActiveGrant: true,
    discordId: grant.discordId,
    discordUsername: grant.discordUsername,
    expiresAt: grant.expiresAt.toISOString(),
    hoursRemaining: Math.round(hoursRemaining * 10) / 10,
  });
});

// GET /api/discord/grants
router.get("/discord/grants", async (_req, res) => {
  const now = new Date();
  const grants = await db
    .select()
    .from(discordGrantsTable)
    .where(
      and(
        eq(discordGrantsTable.isExpired, false),
        gt(discordGrantsTable.expiresAt, now)
      )
    )
    .orderBy(discordGrantsTable.grantedAt);

  res.json(
    grants.map((g) => ({
      id: g.id,
      discordId: g.discordId,
      discordUsername: g.discordUsername,
      grantedAt: g.grantedAt.toISOString(),
      expiresAt: g.expiresAt.toISOString(),
      isExpired: g.isExpired,
    }))
  );
});

export default router;
