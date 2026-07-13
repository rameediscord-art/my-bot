import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const discordGrantsTable = pgTable("discord_grants", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull().unique(),
  discordUsername: text("discord_username").notNull(),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isExpired: boolean("is_expired").default(false).notNull(),
});

export const insertDiscordGrantSchema = createInsertSchema(discordGrantsTable).omit({ id: true, isExpired: true, grantedAt: true });
export type InsertDiscordGrant = z.infer<typeof insertDiscordGrantSchema>;
export type DiscordGrant = typeof discordGrantsTable.$inferSelect;
