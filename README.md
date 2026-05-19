# StockHub

Monorepo for a warehouse and inventory management web application: **Next.js** (App Router) for the frontend and **Express** with **Prisma** for the API and PostgreSQL access.

## Repository layout

| Path   | Role |
|--------|------|
| `web/` | Next.js 16 client; loads environment from the **repository root** `.env`. |
| `api/` | Express REST API; Prisma schema and migrations; uses the **same root** `.env`. |

Browser calls to `http://localhost:3000/api/...` are **rewritten** to the Express server (`API_URL`, default `http://localhost:4000`). The API is not embedded in the Next.js server.

## Prerequisites

- **Node.js** (LTS recommended)
- **PostgreSQL** (e.g. hosted on [Supabase](https://supabase.com/))

## Environment setup

1. Copy the example file to the **repository root** (not inside `web/` or `api/`):

   ```bash
   cp .env.example .env
   ```

   On Windows (PowerShell): `Copy-Item .env.example .env`

2. Fill in at least:

   - `DATABASE_URL` — pooled connection string (Prisma + many hosts)
   - `DIRECT_URL` — direct Postgres URL for migrations when your provider requires it
   - `AUTH_SECRET` — long random string (shared: Express signs JWT cookies, Next verifies them)
   - `FRONTEND_URL` — browser origin (e.g. `http://localhost:3000`)
   - `API_URL` — Express base URL (e.g. `http://localhost:4000`)
   - Optional API hardening: `TRUST_PROXY` when behind a reverse proxy (rate limiting uses client IP); `API_JSON_BODY_LIMIT` (default `256kb`) caps JSON request bodies
   - Optional transactional email (`Brevo` / `Resend` and `EMAIL_FROM`) for registration verification
   - Optional `VERIFY_TTL_MINUTES` — how long signup verification links stay valid (defaults to **1440** = 24h; use e.g. `2` locally for quick expiry tests)

See `.env.example` for comments and optional variables (e.g. superadmin seed).

**Never commit `.env`.** It is listed in `.gitignore`.

## Database (Prisma)

From `api/`:

```bash
cd api
npm install
npx dotenv -e ../.env -- prisma migrate deploy
npx dotenv -e ../.env -- prisma generate
```

Optional superadmin bootstrap (requires `SEED_SUPERADMIN_*` in `.env`):

```bash
npx dotenv -e ../.env -- prisma db seed
```

Other useful scripts are defined in `api/package.json` (`db:migrate`, `db:studio`, etc.).

## Local development

Run **both** services (two terminals):

**API**

```bash
cd api
npm run dev
```

**Web**

```bash
cd web
npm install
npm run dev
```

- Frontend: `http://localhost:3000` (or the port Next prints)
- API: `http://localhost:4000` by default (`PORT` in `.env`)

Health check: `GET http://localhost:4000/api/health`

## Authentication (overview)

- Registration creates a **`PendingRegistration`** until the user opens the verification link.
- After verification, a **`User`** row exists with a required **`emailVerified`** timestamp.
- Session: HTTP-only cookie `stockhub_session` (JWT), issued by Express, verified by Next middleware and `getSession()`.

Auth routes (proxied through Next as `/api/auth/...`): `register`, `login`, `logout`, `verify-email`.

## Production build

```bash
cd api && npm run build && npm start
cd web && npm run build && npm start
```

Set `NODE_ENV=production` and the same `.env` keys your host expects; ensure `FRONTEND_URL` and `API_URL` match your deployed origins when using rewrites.

## License

See [`LICENSE`](LICENSE) in this repository.
