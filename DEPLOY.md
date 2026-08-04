# StockHub — deploy checklist

Operational guide for production: database, environment, deploy order, and smoke tests.

For local setup see [README.md](README.md). Copy [`.env.example`](.env.example) to `.env` at the repo root.

## Architecture

| Component | Typical host | Role |
|-----------|--------------|------|
| `web/` | Vercel (or similar) | Next.js frontend |
| `api/` | Railway, Render, Fly, etc. | Express REST API + Prisma |
| PostgreSQL | Supabase | Database |

The browser only talks to the frontend origin. Next.js rewrites `/api/*` to Express using `API_URL` (see `web/next.config.ts`).

## 1. Database migrations (Supabase)

Run **before** or **immediately after** pointing production env at Supabase. Use **`migrate deploy`**, not `migrate dev` (the latter can prompt for a full reset if an old migration checksum was modified).

```bash
cd api
npm install
npm run db:migrate:deploy
npm run db:generate
```

Check status:

```bash
npx dotenv -e ../.env -- prisma migrate status
```

All migrations should show as applied. Recent ones required for customers and customer orders:

- `20260722100000_add_customers`
- `20260723100000_movement_customer_order_link`

**Optional — bootstrap superadmin** (empty database only):

```bash
npm run db:seed
```

Requires `SEED_SUPERADMIN_EMAIL`, `SEED_SUPERADMIN_PASSWORD`, and name fields in `.env`.

On Windows, stop the API dev server before `prisma generate` if you hit `EPERM` on the query engine DLL.

## 2. Environment variables

Use the **repo root** `.env` locally. In production, set the same keys on each host (API vs web).

### Required — API

| Variable | Example | Notes |
|----------|---------|--------|
| `NODE_ENV` | `production` | Enables `secure` session cookies |
| `DATABASE_URL` | Supabase pooler `:6543?pgbouncer=true` | App connections |
| `DIRECT_URL` | Supabase direct `:5432` | Migrations |
| `AUTH_SECRET` | Random string ≥ 32 chars | Signs JWT session cookie |
| `FRONTEND_URL` | `https://your-app.vercel.app` | No trailing slash; CORS, redirects, verification links |

### Required — Web (Next.js)

| Variable | Example | Notes |
|----------|---------|--------|
| `NODE_ENV` | `production` | |
| `AUTH_SECRET` | **Same value as API** | Verifies JWT in middleware / `getSession()` |
| `API_URL` | `https://your-api.example.com` | Rewrite target for `/api/*` |

### Required — Email (API, production registration)

Without mail configured, registration returns **503** in production.

| Variable | Notes |
|----------|--------|
| `MAIL_PROVIDER` | `brevo` or `resend` (recommended: set explicitly) |
| `BREVO_API_KEY` or `RESEND_API_KEY` | One provider |
| `EMAIL_FROM` | Verified sender, e.g. `StockHub <noreply@yourdomain.com>` |

Also used for supplier order emails.

### Recommended — API (behind reverse proxy)

| Variable | Notes |
|----------|--------|
| `TRUST_PROXY` | `1` — correct client IP for rate limiting |
| `PORT` | Usually set by the host |

### Do not set in production

| Variable | Why |
|----------|-----|
| `RATE_LIMIT_DISABLED=1` | Disables auth rate limits (local testing only) |

### Example — API host

```env
NODE_ENV=production
DATABASE_URL=postgresql://...@...pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...@...supabase.com:5432/postgres
AUTH_SECRET=your-shared-secret-at-least-32-characters
FRONTEND_URL=https://stockhub.vercel.app
PORT=4000
TRUST_PROXY=1
MAIL_PROVIDER=brevo
BREVO_API_KEY=xkeysib-...
EMAIL_FROM=StockHub <noreply@yourdomain.com>
```

### Example — Web host (e.g. Vercel, root directory `web/`)

```env
NODE_ENV=production
AUTH_SECRET=your-shared-secret-at-least-32-characters
API_URL=https://stockhub-api.example.com
```

## 3. Deploy order

1. Configure production `.env` / host secrets for **API** (including Supabase URLs).
2. Run `npm run db:migrate:deploy` and `npm run db:generate` against production DB.
3. Deploy **API** → verify `GET /api/health` returns `{ "ok": true }`.
4. Deploy **Web** with `AUTH_SECRET` and `API_URL`.
5. Run optional `db:seed` if you need a first superadmin.
6. Complete the smoke test checklist below.

### Build commands (reference)

```bash
cd api && npm run build && npm start
cd web && npm run build && npm start
```

## 4. Post-deploy quick checks (~5 min)

- [ ] `GET https://<api-host>/api/health` → `{ ok: true }`
- [ ] Frontend loads over **HTTPS** (session cookies are `secure` in production)
- [ ] Login with an existing user (or seeded superadmin)
- [ ] `AUTH_SECRET` is identical on API and web (otherwise 401 / redirect loops)
- [ ] `FRONTEND_URL` on API matches the exact frontend origin (CORS)
- [ ] Test registration + verification email (production requires mail)

## 5. Smoke test E2E (~30–45 min)

### Auth and shell

- [ ] Login / logout (logout from profile page)
- [ ] Register + email verification (production)
- [ ] Navbar notification unread count

### Articles

- [ ] List articles; filter low stock from dashboard link (`?lowStock=true&active=true`)
- [ ] Article detail → manual stock adjustment (+ / −)
- [ ] Another user receives `STOCK_ADJUSTMENT` notification

### Supplier orders (admin)

- [ ] Create supplier order → supplier email sent
- [ ] Declare arrived → in-app notification
- [ ] Complete checking (line conformity)
- [ ] Close as succeeded → stock increased (`LOAD` movement)

### Customer orders (admin)

- [ ] Create customer order → stock decreased
- [ ] Confirm pickup → order closed

### Dashboard

- [ ] Three sections show correct counts
- [ ] Filter links open lists matching dashboard numbers

### Optional

- [ ] Staff list / role change (superadmin)
- [ ] Internal chat / messages
- [ ] Profile: password change, profile photo

## 6. Common failures

| Symptom | Likely cause |
|---------|----------------|
| Login works locally, not in prod | Site not on HTTPS → `secure` cookie not stored |
| 401 on all authenticated routes | `AUTH_SECRET` mismatch between API and web |
| CORS or blocked fetch | Wrong `FRONTEND_URL` on API |
| `/api/*` errors from frontend | Wrong `API_URL` on web host |
| Registration returns 503 | Email env not set on API |
| Customer / customer order 500 | Migrations not applied on Supabase |
| Verification link broken | `FRONTEND_URL` does not match deployed frontend URL |
| Dashboard count ≠ filtered list | Low-stock link must include `active=true` (dashboard counts active articles only) |

## 7. Course deliverables (reminder)

After deploy and smoke tests:

- [ ] Presentation PDF
- [ ] README / repo ready for submission (no secrets committed)
