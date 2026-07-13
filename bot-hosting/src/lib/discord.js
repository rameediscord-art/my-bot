import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { logger } from "./logger.js";

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const ROLE_ID = process.env.DISCORD_ROLE_ID;

if (!BOT_TOKEN) throw new Error("DISCORD_BOT_TOKEN is required");
if (!GUILD_ID) throw new Error("DISCORD_GUILD_ID is required");
if (!ROLE_ID) throw new Error("DISCORD_ROLE_ID is required");

const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

export async function addRole(discordUserId) {
  await rest.put(Routes.guildMemberRole(GUILD_ID, discordUserId, ROLE_ID));
  logger.info({ discordUserId }, "Role added to user");
}

export async function removeRole(discordUserId) {
  try {
    await rest.delete(Routes.guildMemberRole(GUILD_ID, discordUserId, ROLE_ID));
    logger.info({ discordUserId }, "Role removed from user");
  } catch (err) {
    if (err?.status === 404) {
      logger.warn({ discordUserId }, "User or role not found during removal (404), skipping");
      return;
    }
    throw err;
  }
}
