# Discord Temp Access Bot

A standalone Node.js bot that grants temporary Discord roles via OAuth2 and auto-removes them after a set time.

## Setup

1. Copy `.env.example` to `.env` and fill in your values.
2. Run `npm install`
3. Set startup file to `index.js` (or run `npm start`)

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port to listen on (default: 3000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `DISCORD_BOT_TOKEN` | Your bot token from Discord Developer Portal |
| `DISCORD_CLIENT_ID` | OAuth2 Client ID |
| `DISCORD_CLIENT_SECRET` | OAuth2 Client Secret |
| `DISCORD_GUILD_ID` | Your server ID |
| `DISCORD_ROLE_ID` | Role ID to grant |
| `SESSION_SECRET` | Any random secret string |
| `ACCESS_DURATION_HOURS` | How long the role lasts (default: 1) |

## OAuth2 Redirect URI

In Discord Developer Portal → OAuth2 → Redirects, add:
```
https://your-domain.com/api/callback
```

## Bot Requirements

- Bot must be in your server
- Bot needs **Manage Roles** permission
- Bot's role must be **above** the temp role in the server's role hierarchy
