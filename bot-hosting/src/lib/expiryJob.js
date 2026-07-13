import { db, discordGrantsTable } from "../db.js";
import { and, eq, lt } from "drizzle-orm";
import { removeRole } from "./discord.js";
import { logger } from "./logger.js";

const JOB_INTERVAL_MS = 60 * 1000; // every 60 seconds

async function runExpiryCheck() {
  const now = new Date();

  const expired = await db
    .select()
    .from(discordGrantsTable)
    .where(
      and(
        eq(discordGrantsTable.isExpired, false),
        lt(discordGrantsTable.expiresAt, now)
      )
    );

  if (expired.length === 0) return;

  logger.info({ count: expired.length }, "Processing expired grants");

  for (const grant of expired) {
    try {
      await removeRole(grant.discordId);
    } catch (err) {
      logger.error({ err, discordId: grant.discordId }, "Failed to remove role during expiry check");
    }

    await db
      .update(discordGrantsTable)
      .set({ isExpired: true })
      .where(eq(discordGrantsTable.id, grant.id));

    logger.info({ discordId: grant.discordId }, "Grant expired and role removed");
  }
}

export function startExpiryJob() {
  logger.info({ intervalMs: JOB_INTERVAL_MS }, "Starting role expiry background job");

  runExpiryCheck().catch((err) =>
    logger.error({ err }, "Error in initial expiry check")
  );

  setInterval(() => {
    runExpiryCheck().catch((err) =>
      logger.error({ err }, "Error in expiry check")
    );
  }, JOB_INTERVAL_MS);
}
