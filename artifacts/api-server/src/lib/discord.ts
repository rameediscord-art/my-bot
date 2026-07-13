import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import { logger } from "./logger.js";

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const GUILD_ID = process.env.DISCORD_GUILD_ID!;
const ROLE_ID = process.env.DISCORD_ROLE_ID!;

// REST client for role management (lightweight — no gateway needed)
const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

export async function addRole(discordUserId: string): Promise<void> {
  try {
    await rest.put(Routes.guildMemberRole(GUILD_ID, discordUserId, ROLE_ID));
    logger.info({ discordUserId }, "Role added to user");
  } catch (err) {
    logger.error({ err, discordUserId }, "Failed to add role");
    throw err;
  }
}

export async function removeRole(discordUserId: string): Promise<void> {
  try {
    await rest.delete(Routes.guildMemberRole(GUILD_ID, discordUserId, ROLE_ID));
    logger.info({ discordUserId }, "Role removed from user");
  } catch (err) {
    // 404 = user left server or never had role — not fatal
    const status = (err as any)?.status;
    if (status === 404) {
      logger.warn({ discordUserId }, "User or role not found during removal (404), skipping");
      return;
    }
    logger.error({ err, discordUserId }, "Failed to remove role");
    throw err;
  }
}
