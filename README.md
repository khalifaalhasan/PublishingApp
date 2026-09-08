# web-si

Rebuild of the Information Systems study program portal (replacing si.radenfatah.ac.id). Turborepo monorepo with a SvelteKit frontend and an Elysia (Bun) backend.

## Stack

- **Frontend**: SvelteKit
- **Backend**: Elysia (Bun runtime)
- **Database**: PostgreSQL (via Drizzle)
- **Monorepo tooling**: Turborepo + Bun workspaces
- **Reverse proxy / TLS (production)**: Caddy

## Repo structure

```
apps/
  front-sveltekit/  -> SvelteKit frontend
  api-elysia/       -> Elysia backend API
  tunnel/           -> SSH tunnel helper (see "Remote backend access" below)
packages/           -> shared packages (config, types, etc.)
deploy/             -> deployment-related files
docker-compose.yml         -> local/dev compose
docker-compose.prod.yml    -> production compose
```

## Prerequisites

- [Bun](https://bun.sh) `>= 1.4.0`
- `ssh` client available on your machine (already built into macOS, Linux, and Windows 10/11)

## Two ways to run this project

### 1. You have the backend running locally too

If you're running Postgres + the backend yourself (e.g. via `docker-compose.yml`), just run everything:

```bash
bun install
bun run dev
```

This starts the frontend and backend together.

### 2. You only run the frontend (backend lives on the VPS)

This is the setup for most contributors — the backend and database run on our VPS, and you only need the frontend running locally. You reach the backend through an SSH tunnel instead of running it yourself.

**Setup (one-time):**

1. Ask ke orang ganteng (project owner) for:
   - An SSH keypair for the tunnel, or instructions to generate your own and send him the public key
   - The values for your `.env` file (VPS host, port, and SSH username — see `.env.example`)
2. Copy the example env file and fill in the values he gives you:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   bun install
   ```

**Every time you want to work on the frontend:**

```bash
bun run dev:remote
```

This starts two things together, in one terminal:
- An SSH tunnel to the backend on the VPS (auto-reconnects if your connection drops)
- The SvelteKit dev server

Stopping it (`Ctrl+C`) stops both. If your wifi drops mid-session, the tunnel reconnects on its own — you don't need to restart anything.

**You will not have shell access to the VPS.** The SSH account you're given can only open this one tunnel — it can't browse files, run commands, or reach anything else on the server. That's intentional, not a mistake on your end.

## Environment variables

See `.env.example` for the full list. For the remote-tunnel workflow, you need:

| Variable | Description |
|---|---|
| `TUNNEL_SSH_HOST` | VPS address |
| `TUNNEL_SSH_PORT` | SSH port (custom, not always 22 — ask Al) |
| `TUNNEL_SSH_USER` | Your restricted SSH username |
| `TUNNEL_LOCAL_PORT` | Local port the backend will be reachable on (e.g. `3001`) |
| `TUNNEL_REMOTE_PORT` | Port the backend listens on inside the VPS (usually the same number) |

Once the tunnel is up, the backend is reachable at `http://localhost:<TUNNEL_LOCAL_PORT>` exactly as if it were running on your machine.

## Common scripts

| Command | What it does |
|---|---|
| `bun run dev` | Run all apps (assumes backend runs locally) |
| `bun run dev:remote` | Run frontend + SSH tunnel only (backend on VPS) |
| `bun run build` | Build all apps |
| `bun run lint` | Lint all apps |
| `bun run check-types` | Type-check all apps |
| `bun run format` | Format the codebase with Prettier |

## Troubleshooting

- **"Permission denied (publickey)" when the tunnel tries to connect** — your SSH key isn't set up correctly, or hasn't been added to the VPS yet. Ping Al.
- **Tunnel connects but the frontend still can't reach the API** — double check `TUNNEL_LOCAL_PORT` in your `.env` matches whatever URL the frontend is configured to call (e.g. `http://localhost:3001`).
- **Getting disconnected immediately after connecting, no error shown** — that's actually expected. Your SSH account has no shell, so it disconnects right after the tunnel opens; the tunnel itself stays up.