import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "../../data.json");

function read() {
  if (!existsSync(DB_PATH)) {
    return { grants: [] };
  }
  return JSON.parse(readFileSync(DB_PATH, "utf8"));
}

function write(data) {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
}

let _nextId = null;
function nextId() {
  if (_nextId === null) {
    const data = read();
    _nextId = data.grants.reduce((max, g) => Math.max(max, g.id ?? 0), 0) + 1;
  }
  return _nextId++;
}

// Get a single active (non-expired, not past expiry) grant for a user
export function getActiveGrant(discordId) {
  const { grants } = read();
  const now = new Date();
  return (
    grants.find(
      (g) =>
        g.discordId === discordId &&
        !g.isExpired &&
        new Date(g.expiresAt) > now
    ) ?? null
  );
}

// Save a new grant (overwrites any old records for this user first)
export function saveGrant(discordId, discordUsername, expiresAt) {
  const data = read();
  // Mark any existing records for this user as expired
  data.grants = data.grants.map((g) =>
    g.discordId === discordId ? { ...g, isExpired: true } : g
  );
  data.grants.push({
    id: nextId(),
    discordId,
    discordUsername,
    grantedAt: new Date().toISOString(),
    expiresAt: expiresAt instanceof Date ? expiresAt.toISOString() : expiresAt,
    isExpired: false,
  });
  write(data);
}

// Get all grants that have passed their expiry time but aren't marked expired yet
export function getExpiredGrants() {
  const { grants } = read();
  const now = new Date();
  return grants.filter((g) => !g.isExpired && new Date(g.expiresAt) <= now);
}

// Mark a grant as expired by discordId
export function markExpired(discordId) {
  const data = read();
  data.grants = data.grants.map((g) =>
    g.discordId === discordId ? { ...g, isExpired: true } : g
  );
  write(data);
}

// Get all currently active grants
export function getActiveGrants() {
  const { grants } = read();
  const now = new Date();
  return grants
    .filter((g) => !g.isExpired && new Date(g.expiresAt) > now)
    .sort((a, b) => new Date(a.grantedAt) - new Date(b.grantedAt));
}
