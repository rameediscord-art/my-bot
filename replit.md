# Discord Temporary Access Bot

A web app that grants users a temporary Discord role after they complete a Lockr task-locked link. Users log in with Discord OAuth2, receive the role automatically, and lose it after a configurable number of hours via a background expiry job.

## Run & Operate

- `pnpm --filter @workspace/discord-unlock run dev` — run the frontend (port assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter + Tailwind CSS
- API: Express 5 + express-session
- DB: PostgreSQL + Drizzle ORM (`discord_grants` table)
- Discord: discord.js REST client (no gateway needed)
- Auth: Discord OAuth2 (identify scope)
- Background job: setInterval (60s) for role expiry

## Where things live

- `artifacts/discord-unlock/src/` — React frontend (unlock page, success page)
- `artifacts/api-server/src/routes/discord.ts` — OAuth routes (`/api/auth/discord`, `/api/callback`, `/api/discord/status`, `/api/discord/grants`)
- `artifacts/api-server/src/lib/discord.ts` — discord.js REST helpers (addRole, removeRole)
- `artifacts/api-server/src/lib/expiryJob.ts` — background expiry checker (runs every 60s)
- `lib/db/src/schema/discordGrants.ts` — `discord_grants` table schema

## OAuth Flow

1. User visits `/` → clicks "Login with Discord" → navigates to `/api/auth/discord`
2. Server redirects to Discord OAuth with state parameter (stored in session)
3. Discord redirects to `/api/callback?code=...&state=...`
4. Server: verifies state, exchanges code, fetches user info, grants role, saves to DB
5. Server redirects to `/success?username=...&expires_at=...&hours=24`
6. Background job checks every 60s for expired grants and removes roles

## Configuration

| Secret / Env Var | Description |
|---|---|
| `DISCORD_BOT_TOKEN` | Bot token from Discord Developer Portal |
| `DISCORD_CLIENT_ID` | OAuth2 Client ID |
| `DISCORD_CLIENT_SECRET` | OAuth2 Client Secret |
| `DISCORD_GUILD_ID` | Server (guild) ID |
| `DISCORD_ROLE_ID` | Role ID to grant |
| `SESSION_SECRET` | Express session secret |
| `ACCESS_DURATION_HOURS` | How long to grant access (default: 24) |

## Discord Developer Portal setup required

1. Go to your app at discord.com/developers/applications
2. OAuth2 → Redirects → Add: `https://<your-replit-domain>/api/callback`
3. Bot → Permissions → Enable "Manage Roles"
4. Make sure your bot's role sits **above** the temp role in your server's role hierarchy

## Lockr setup

Set your Lockr locked-link destination to: `https://<your-replit-domain>/`

## Architecture decisions

- **PostgreSQL over SQLite**: The project has a pre-provisioned Postgres DB; no extra setup needed vs SQLite
- **REST client (no Gateway)**: discord.js REST-only mode is used for role management — no WebSocket bot connection needed, which avoids gateway intent configuration
- **State in express-session**: OAuth state param stored in server-side session (not cookie) to prevent CSRF
- **Duplicate grant handling**: If a user re-authenticates while an active grant exists, the existing expiry is preserved (not extended/reset)
- **Expiry is best-effort**: If role removal fails (user left server, bot permissions revoked), the DB row is still marked expired

## User preferences

- Access duration configurable via `ACCESS_DURATION_HOURS` env var (default 24 hours)

## Gotchas

- Bot's role **must** be above the temp role in the server's role hierarchy, or Discord returns 403
- The redirect URI registered in Discord must exactly match what the server sends (derived from `REPLIT_DEV_DOMAIN`)
- After deploying, add the production domain to Discord's allowed redirect URIs as well
