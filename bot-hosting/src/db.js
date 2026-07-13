import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

export const discordGrantsTable = pgTable("discord_grants", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull().unique(),
  discordUsername: text("discord_username").notNull(),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isExpired: boolean("is_expired").default(false).notNull(),
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema: { discordGrantsTable } });

// Create table if it doesn't exist
export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS discord_grants (
      id SERIAL PRIMARY KEY,
      discord_id TEXT NOT NULL UNIQUE,
      discord_username TEXT NOT NULL,
      granted_at TIMESTAMP DEFAULT NOW() NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      is_expired BOOLEAN DEFAULT FALSE NOT NULL
    )
  `);
}
