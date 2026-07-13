import { getExpiredGrants, markExpired } from "../db.js";
import { removeRole } from "./discord.js";
import { logger } from "./logger.js";

const JOB_INTERVAL_MS = 60 * 1000; // every 60 seconds

async function runExpiryCheck() {
  const expired = getExpiredGrants();

  if (expired.length === 0) return;

  logger.info({ count: expired.length }, "Processing expired grants");

  for (const grant of expired) {
    try {
      await removeRole(grant.discordId);
    } catch (err) {
      logger.error({ err, discordId: grant.discordId }, "Failed to remove role during expiry check");
    }

    // Mark expired regardless of whether role removal succeeded
    markExpired(grant.discordId);
    logger.info({ discordId: grant.discordId }, "Grant expired and role removed");
  }
}

export function startExpiryJob() {
  logger.info({ intervalMs: JOB_INTERVAL_MS }, "Starting role expiry background job");

  // Run immediately on start to catch grants that expired while server was down
  runExpiryCheck().catch((err) =>
    logger.error({ err }, "Error in initial expiry check")
  );

  setInterval(() => {
    runExpiryCheck().catch((err) =>
      logger.error({ err }, "Error in expiry check")
    );
  }, JOB_INTERVAL_MS);
}
