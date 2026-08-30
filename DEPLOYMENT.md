# Deployment Guide — Reflect AI

Everything needed to run this in production, plus the reasoning behind each choice.

---

## 0. Quickstart — get a live URL (single service on Render)

The fastest route to a working public link. Express serves both the API **and** the built React app, so everything runs on one origin and the httpOnly auth cookies work without any cross-site complications.

**1. Push to GitHub** (confirm `.env` is ignored — it is).

**2. MongoDB Atlas** → Network Access → add `0.0.0.0/0` (Render's egress IPs aren't fixed on lower tiers).

**3. Render** → New → **Web Service** → connect the repo:

| Field | Value |
|---|---|
| Root Directory | *(leave blank — repo root)* |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

**4. Environment variables** (Render → Environment):
```
NODE_ENV=production
SERVE_STATIC=true
MONGODB_URI=<your Atlas connection string>
JWT_SECRET=<node -e "console.log(require('crypto').randomBytes(48).toString('hex'))">
GEMINI_API_KEY=<key>
GOOGLE_CLIENT_ID=<id>
GOOGLE_CLIENT_SECRET=<secret>
CLIENT_URL=https://<your-service>.onrender.com
GOOGLE_CALLBACK_URL=https://<your-service>.onrender.com/api/v1/auth/google/callback
```
Leave `REDIS_URL` unset — caching disables itself cleanly and MongoDB serves everything.

> `CLIENT_URL` and `GOOGLE_CALLBACK_URL` need the real Render URL, which you only learn after the first deploy. Deploy once, copy the URL, set both, redeploy.

**5. Google Cloud Console** → Credentials → your OAuth client → **Authorized redirect URIs** → add exactly:
```
https://<your-service>.onrender.com/api/v1/auth/google/callback
```

**6. Make login work for other people.** On an unpublished "External" OAuth app, only accounts listed under **Test users** can sign in. To let anyone in, go to OAuth consent screen → **Publish app**. This app only requests `openid`, `email` and `profile` — non-sensitive scopes — so publishing generally does not require Google's verification review. Verify this in the console before relying on it.

**Live URL:** `https://<your-service>.onrender.com`

### Cold starts — read this before putting the link on a resume

Render's free tier **spins a service down after 15 minutes of inactivity**, and the next request takes roughly a minute while it wakes. A recruiter clicking a link that hangs for 60 seconds is worse than no link.

Options, honestly ranked:
1. **Paid instance (~$7/month)** — never sleeps. The only properly reliable fix, and cheap for the duration of a job search.
2. **Keep-warm ping** — a free uptime monitor hitting `/api/health` every 10 minutes. Render's free tier grants **750 instance hours/month** and a month is ~730 hours, so one continuously-running service does fit. Render does not officially support this, so treat it as a workaround, and note it only works if this is your *only* free service.
3. **Accept it** and add "first load may take ~60s (free hosting cold start)" next to the link. Sets expectations and is more professional than a link that appears broken.

---

## 1. Architecture

```
                    ┌──────────────────────┐
   browser  ───────▶│  Static host / nginx │   React SPA (built assets)
                    └──────────┬───────────┘
                               │  /api/* proxied  (same origin ⇒ cookies work)
                    ┌──────────▼───────────┐
                    │   Express API        │   Node 22
                    └───┬──────────────┬───┘
                        │              │
              ┌─────────▼──────┐  ┌────▼─────────┐
              │ MongoDB Atlas  │  │ Redis (opt.) │
              │ source of truth│  │  cache only  │
              └────────────────┘  └──────────────┘
                        │
                 ┌──────▼───────┐
                 │ Gemini API   │
                 └──────────────┘
```

**Why the API is proxied under the same origin:** auth uses `httpOnly` cookies. Same-origin means no third-party-cookie problems, no CORS preflight on every request, and no `SameSite=None` requirement. If you split the domains instead, set `CLIENT_URL` exactly and serve both over HTTPS.

**Redis is optional by design.** If it's unreachable the API logs one warning, disables caching, and serves everything from MongoDB. A cache outage degrades performance, never availability.

---

## 2. Environment variables

Copy `server/.env.example` → `server/.env`. Required:

| Variable | Notes |
|---|---|
| `MONGODB_URI` | Atlas or self-hosted. **Whitelist your server's IP** in Atlas → Network Access. |
| `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `GEMINI_API_KEY` | Google AI Studio |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud Console → Credentials → OAuth client ID (Web) |
| `GOOGLE_CALLBACK_URL` | Must match an **Authorized redirect URI** character-for-character |
| `CLIENT_URL` | Your frontend origin — this is the CORS allowlist |
| `NODE_ENV` | Set to `production`. This enables secure cookies, rate limits, and `trust proxy`. |
| `REDIS_URL` | Optional. Leave blank to disable caching. |

> `NODE_ENV=production` is not cosmetic: it switches cookies to `Secure; SameSite=None`, activates rate limiting, enables `trust proxy` (so rate limits key off the real client IP rather than your load balancer), and stops error responses leaking internals.

---

## 3. Option A — Docker Compose (single host)

Simplest path; runs everything including its own MongoDB and Redis.

```bash
# Provide secrets to compose (it reads a root .env)
cat > .env <<'EOF'
JWT_SECRET=<64+ random hex chars>
GEMINI_API_KEY=<key>
GOOGLE_CLIENT_ID=<id>
GOOGLE_CLIENT_SECRET=<secret>
CLIENT_URL=http://localhost:8080
GOOGLE_CALLBACK_URL=http://localhost:8080/api/v1/auth/google/callback
EOF

npm run docker:up      # docker compose up --build
```

Open `http://localhost:8080`. Add `http://localhost:8080/api/v1/auth/google/callback` to your Google OAuth client.

Notes:
- `depends_on: condition: service_healthy` means the API waits for a MongoDB that can actually answer a ping, not merely a started container.
- Data persists in the `mongo-data` / `redis-data` volumes.
- For a real domain, put Caddy or Traefik in front for automatic TLS, and update `CLIENT_URL` + `GOOGLE_CALLBACK_URL` to the `https://` URLs.

---

## 4. Option B — Managed services (recommended for real traffic)

| Piece | Service | Notes |
|---|---|---|
| Frontend | Vercel / Netlify / Cloudflare Pages | Build `npm run build --workspace client`, publish `client/dist`. Add a rewrite of `/api/*` → your API URL. |
| API | Render / Railway / Fly.io | Root `server/`, start `node src/server.js`, health check `/api/health`. |
| Database | **MongoDB Atlas** | M0 is fine to start. Whitelist the API's egress IPs. |
| Cache | **Upstash Redis** | Serverless; use the `rediss://` URL. Optional. |

**SPA rewrite is essential.** Client-side routes like `/analytics` don't exist as files — without a rewrite to `index.html` a refresh returns 404. The bundled `nginx.conf` handles this via `try_files`; on Vercel/Netlify configure the equivalent.

---

## 5. Security posture

Already implemented:

- **helmet** security headers; CSP intentionally left to the static host that serves the HTML
- **Rate limiting**, tiered by cost: auth 30/15min, AI sends 12/min, reports 10/min, general 240/min — keyed by user id when authenticated, else IP
- **`trust proxy`** in production so limits use the true client IP
- **1 MB body cap** to prevent memory-exhaustion payloads
- **CORS allowlist** (a single origin, not `*`) with credentials
- **httpOnly cookies** — tokens are unreadable by JavaScript, unlike `localStorage`
- **Refresh-token rotation**; only a SHA-256 **hash** is stored, so a database leak can't forge a session
- **TTL index** auto-expires sessions
- **Allow-list validation** on settings; own-property reads only (no prototype-chain surprises)
- **Passwordless** (Google OAuth) — no credentials to store or leak

Before going live:
1. Rotate `JWT_SECRET`; never reuse the development value.
2. Confirm `.env` is git-ignored (it is) and check `git log` in case a secret was ever committed.
3. Create a least-privilege MongoDB user (`readWrite` on one database, not `atlasAdmin`).
4. Restrict the Gemini API key to your server's IPs in Google Cloud.
5. Serve over HTTPS only.

---

## 6. Performance measures in place

**Client**
- Route-level code splitting: Analytics and Settings load on demand, keeping Recharts out of the initial bundle
- Vendor chunks split per library, so an app change doesn't invalidate cached React/Recharts
- `React.memo` on message and history rows
- `content-visibility: auto` skips layout/paint for off-screen rows — most of the benefit of a windowing library, no dependency
- React Query caching with `staleTime`, plus optimistic updates
- Debounced search (350 ms)

**Server**
- gzip via `compression`
- Cursor (keyset) pagination — no `skip`, so page 500 costs the same as page 1
- `.lean()` on read-heavy queries, avoiding Mongoose document hydration
- Redis cache-aside with documented TTLs and event-based invalidation
- Compound indexes matching actual query shapes (`{userId, createdAt, _id}`)
- Long-term AI memory refreshed only every 6 turns / 3 days instead of every message

---

## 7. Operations

**Health checks**
```bash
curl https://your-api/api/health
# {"status":"ok","database":"connected","cache":"enabled","uptime":1234}
```
Returns **503** when MongoDB is unreachable — use it as the readiness probe so traffic isn't routed to a container that can't serve.

**Graceful shutdown** — on `SIGTERM` the server stops accepting connections, drains in-flight requests, closes MongoDB and Redis, then exits (10 s cap). This prevents dropped responses on every deploy.

**Logging** — structured, level-prefixed to stdout, which is what container platforms collect. `logger` in `config/logger.js` is a single seam: swap it for `pino` and every call site gains JSON logs.

**What to monitor**
- `/api/health` (uptime + readiness)
- 5xx rate and p95 latency on `POST /api/v1/journals/:id/messages` (the AI path)
- Gemini spend and error rate
- MongoDB connections and slow queries
- `429` rate — a spike means limits are too tight or someone is abusing the API

---

## 8. Backups

`mongodump` on a schedule, or Atlas automated backups (available from M10; M0/M2 have snapshot limits). Users can also self-export from **Settings → Export Your Journal** (full JSON) or **Trend Analysis → Download CSV**.

---

## 9. Known gaps

Honest list of what is *not* finished:

- **Notification delivery.** Preferences are stored, but nothing sends reminders — needs a scheduler (cron/Cloud Scheduler) and an email/push provider. The UI marks these "saved, not yet active".
- **Interface translation.** The language preference persists; no translation files exist yet.
- **Automated tests.** Logic was verified with ad-hoc scripts during development, but there's no committed test suite. `vitest` for the pure utilities (pattern detection, analytics engine, cursor, CSV, validators) would be the highest-value addition — they're already written as pure functions specifically to make this easy.
- **Streaming responses.** Replies animate client-side; true token-by-token SSE streaming from Gemini isn't wired up.
- **Attachments and voice input.** Present in the composer but disabled.
