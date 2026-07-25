# Reflect AI — Architecture & 13-Phase Upgrade Roadmap

**Project:** Passion Journal AI → **Reflect AI** (AI Mental Wellness & Personal Growth companion)
**Prepared by:** Technical Lead
**Date:** 20 Jul 2026
**Stack decision:** Keep **Vite + React (client)** and **Express (server)** as a monorepo. Write UI as framework-agnostic components so a future Next.js move is low-cost. **Not** rebuilding from scratch — every phase upgrades existing code.

> **Guiding principle for the whole project:** Analyze → reuse → upgrade incrementally. We never delete working logic; we relocate and extend it. Each phase ships independently, is testable, and leaves `main` deployable.

---

## 0. Product framing (why this matters before architecture)

Today the app does one thing: *take one journal entry → return one structured analysis → show it on one page.* The "Reflect AI" mockups describe a different product: **an ongoing, memory-aware conversation** (center), **a browsable history of reflections** (left), and **live personal-growth insights** (right), plus a full **Trend Analysis** page.

That shift — from *single analyze* to *stateful companion* — is the real work. Everything below serves it. The AI must feel like a supportive friend/mentor/coach that remembers your journey, celebrates progress, spots stress/burnout patterns, and always makes clear it is **not a substitute for a licensed mental-health professional** and encourages professional help when signals warrant it.

---

## 1. Current-state analysis (Phase 1 — done)

### 1.1 What exists

**Client** (`client/`): React 19, Vite, Tailwind v4, Recharts, framer-motion, react-router-dom (installed, unused).
- `src/main.jsx` → wraps `<App/>` in `<JournalProvider>`.
- `src/context/JournalContext.jsx` → all state: `journalText`, `analysis`, `history` (via `useLocalStorage`), `loading`, `error`, `toast`, plus `analyzeEntry()`.
- `src/services/` → `api.js` (axios instance), `aiService.js` (`POST /ai/analyze`), `journalService.js` (builds entry object).
- `src/pages/Dashboard.jsx` → single page, 12-col grid of cards.
- `src/utils/` → `dashboardUtils.js` (real analytics), `journalUtils.js` (placeholder streak), `analysisEngine.js` (dead duplicate of server rule engine), `mockData.js`.

**Server** (`server/`): Express 5 (ESM).
- `src/app.js` → cors + json + mounts `/api/ai`.
- `src/routes/aiRoutes.js` → `POST /analyze`.
- `src/controllers/aiController.js` → calls Gemini service.
- `src/services/geminiService.js` → `@google/genai`, `gemini-2.5-flash`, one-shot JSON prompt, rule-engine fallback.
- `src/services/ruleEngine.js` → keyword-based fallback.
- `src/validators/analysisValidator.js` → shape check.
- `src/config/env.js` → env loader.

### 1.2 Keep (assets we build on)
- Client service seam (`api.js`/`aiService.js`) — clean place to repoint at real APIs.
- Server layering (`routes → controllers → services → validators → config`) — already the shape of clean architecture.
- Rule-engine graceful degradation — keep as AI fallback.
- `dashboardUtils` analytics (streak, weekly trend, averages, best passion) — move server-side, reuse.

### 1.3 Fix (technical debt & bugs)
| Issue | Location | Action |
|---|---|---|
| `setToast` is undefined → crash on toast close | `client/src/app.jsx` | Pull `setToast` from `useJournal()` |
| Import `./App` resolves only via case-insensitive FS | `client/src/main.jsx` vs `app.jsx` | Rename to `App.jsx`, fix import |
| Dead duplicate of rule engine | `client/src/utils/analysisEngine.js` | Delete |
| Placeholder streak returns `history.length` | `client/src/utils/journalUtils.js` | Delete; standardize on server logic |
| Secret printed to console | `server/src/server.js` | Remove `console.log(GEMINI_API_KEY)` |
| Backend deps in client | `client/package.json` | Remove `express`, `cors`, `dotenv` |
| Score hack `if(score<=10) score*=10` | `geminiService.js` | Enforce via schema/validation |
| Conflicting `grid-cols-1 grid-cols-12`, non-responsive `col-span-8` | `Dashboard.jsx` | Fix responsive grid |
| `dateUtils.js` empty, `mockData` shipped | `client/src/utils/` | Remove after DB wiring |

### 1.4 Gaps vs. vision
No multi-turn chat · no AI memory · no persistence beyond `localStorage` · no auth · no routing/second page · no analytics dashboard · no caching · no rate-limiting/security hardening · no tests · no deploy config.

---

## 2. Target architecture

### 2.1 Repository (monorepo)
```
PassionJournalApp/
├─ client/                 # Vite + React SPA
│  └─ src/
│     ├─ app/              # app shell, router, providers wiring
│     ├─ pages/            # route-level screens (Welcome, Login, Chat, Analytics, Settings, Profile)
│     ├─ features/         # feature slices (chat, insights, history, analytics, auth, settings)
│     ├─ components/       # reusable presentational UI (framework-agnostic)
│     ├─ hooks/            # useJournal, useAuth, useChat, useInfiniteHistory, useTheme…
│     ├─ context/          # AuthContext, ThemeContext, ChatContext
│     ├─ providers/        # composed provider tree
│     ├─ services/         # api client + typed endpoint wrappers
│     ├─ lib/              # axios instance, query client, formatters
│     ├─ types/            # shared TS/JSDoc types (client mirror of server DTOs)
│     ├─ utils/            # pure helpers
│     └─ styles/           # tokens.css (theme vars), globals.css
├─ server/                 # Express API
│  └─ src/
│     ├─ config/           # env, db, redis, oauth, logger
│     ├─ models/           # Mongoose schemas
│     ├─ repository/       # data-access layer (all Mongo/Redis calls live here)
│     ├─ services/         # business logic (ai, analytics, memory, streaks)
│     ├─ controllers/      # thin HTTP handlers
│     ├─ routes/           # route definitions + versioning (/api/v1)
│     ├─ middleware/       # auth, rateLimit, validate, error, security
│     ├─ validators/       # request schema validation (zod)
│     ├─ providers/        # external clients (Gemini, OAuth)
│     ├─ utils/            # helpers, prompt builders
│     └─ types/            # DTOs, enums
├─ package.json            # root workspaces + scripts (dev/build/lint/test)
├─ docker-compose.yml      # mongo + redis + api + client (later phase)
└─ ROADMAP.md
```
**Why:** the layering the server already hints at, made explicit and symmetric across client/server. `repository/` isolates persistence so services never touch the DB driver directly — this is what makes the DB and cache swappable and testable, and what protects us if we later move to Next.js.

### 2.2 Request flow (after refactor)
```
Client feature → service (axios) → /api/v1/... → route
   → middleware (auth, validate, rateLimit)
   → controller (thin) → service (logic)
   → repository (Mongo + Redis) → response
```

### 2.3 Runtime dependencies to add
Server: `mongoose`, `ioredis`, `zod`, `helmet`, `express-rate-limit`, `jsonwebtoken`, `cookie-parser`, `passport` + `passport-google-oauth20` (or `google-auth-library`), `pino` (logging), `compression`.
Client: `@tanstack/react-query` (server-state, caching, optimistic updates), `react-markdown`, `zustand` (light UI state) or keep Context, `date-fns`.

---

## 3. The 13 phases

Each phase: **Objective · Architecture · Folders · Create · Modify · DB · API · UI · Testing · Commit.** Phases are ordered so the app stays runnable throughout.

---

### Phase 1 — Analyze current project ✅ (this document, section 1)
**Objective:** Understand and inventory before changing anything.
**Deliverable:** Section 1 above (keep/fix/gaps).
**Testing:** N/A.
**Commit:** `docs: add architecture analysis and 13-phase roadmap`

---

### Phase 2 — Architecture refactor (no new services yet)
**Objective:** Fix bugs, remove dead code, convert to a clean monorepo, and scaffold the target folders — all while the app keeps working on `localStorage`. Zero behavior change for the user.
**Architecture:** Introduce root workspaces; make server layering explicit (`repository/`, `middleware/`, `providers/`, versioned routes `/api/v1`); compose client providers.
**Folders:** create the empty target folders from §2.1 (`repository/`, `middleware/`, `providers/`, `models/`, `client/src/features`, `client/src/providers`, `client/src/lib`, `client/src/types`).
**Files to create:** root `package.json` (workspaces + `dev` running both), `server/src/middleware/{errorHandler,notFound}.js`, `server/src/config/logger.js`, `client/src/lib/axios.js`, `client/src/providers/AppProviders.jsx`, `client/src/styles/tokens.css` (theme variables extracted).
**Files to modify:** fix `app.jsx`→`App.jsx` + toast bug; delete `analysisEngine.js`, `journalUtils.js`, `mockData.js`; clean `client/package.json` deps; remove secret logging in `server.js`; move `/api/ai` under `/api/v1/ai`; fix `Dashboard.jsx` grid.
**DB:** none.
**API:** unchanged endpoints, re-mounted under `/api/v1`.
**UI:** no visible change (theme tokens extracted so later phases can theme).
**Testing:** app still runs (`npm run dev`), analyze still works, toast closes without crash, lint passes, no dead imports.
**Commit:** `refactor: monorepo layout, clean architecture scaffolding, fix toast crash & dead code`

---

### Phase 3 — MongoDB integration
**Objective:** Replace `localStorage` with persisted data via the API. Introduce Mongoose models + repository layer.
**Architecture:** `repository/` wraps all Mongoose access; services call repositories; `config/db.js` manages the connection with retry.
**Folders:** `server/src/models`, `server/src/repository`.
**Files to create:** `config/db.js`; models for the collections below; `repository/{journalRepo,messageRepo,conversationRepo,moodRepo,userRepo}.js`; `services/journalService.js`, `services/analyticsService.js` (port `dashboardUtils` logic server-side); `routes/v1/journalRoutes.js`, `controllers/journalController.js`.
**Files to modify:** client `journalService.js`/`aiService.js` to hit real endpoints; remove `useLocalStorage` from `JournalContext` (swap to React Query).
**DB — schema (Mongoose, ObjectId refs, indexed):**

| Collection | Key fields | Indexes |
|---|---|---|
| **Users** | name, email(unique), avatar, provider, growthScore, createdAt | `email` unique |
| **OAuthAccounts** | userId→Users, provider, providerAccountId, tokens | `{provider, providerAccountId}` unique |
| **Sessions** | userId, refreshTokenHash, userAgent, expiresAt | `userId`, TTL on `expiresAt` |
| **Journals** (a reflection/conversation thread) | userId, title, pinned, favorite, archived, createdAt, updatedAt | `{userId, updatedAt:-1}` |
| **JournalMessages** | journalId, userId, role(user/ai), content, createdAt | `{journalId, createdAt}` |
| **AIConversations** | journalId, model, promptTokens, latency | `journalId` |
| **MoodAnalysis** | userId, journalId, mood, score, emotion, depth, createdAt | `{userId, createdAt}` |
| **EmotionHistory** | userId, emotion, weight, date | `{userId, date}` |
| **ProgressMetrics** | userId, date, growthScore, consistency, reflectionDepth | `{userId, date}` unique |
| **Goals** | userId, title, status, targetDate | `{userId, status}` |
| **Achievements** | userId, key, title, achievedAt | `{userId, key}` unique |
| **Habits** | userId, name, cadence, streak | `userId` |
| **StreakHistory** | userId, date, active | `{userId, date}` unique |
| **Weekly/Monthly/YearlyAnalytics** | userId, periodStart, aggregates | `{userId, periodStart}` unique |
| **Notifications** | userId, type, read, createdAt | `{userId, read}` |
| **UserSettings / UserPreferences** | userId, theme, aiPrefs, analysisPrefs, notifs | `userId` unique |
| **ActivityLogs** | userId, action, meta, createdAt | `{userId, createdAt}`, TTL optional |
| **AIContextMemory** | userId, summary, recurringThemes[], embeddings?, updatedAt | `userId` unique |
| **Feedback** | userId, messageId, rating, note | `userId` |

**API:** `GET/POST /api/v1/journals`, `GET /journals/:id`, `PATCH /journals/:id`, `DELETE /journals/:id`, `POST /journals/:id/messages`, `GET /journals/:id/messages`.
**UI:** no redesign yet; dashboard reads from API instead of `localStorage`. One-time migration helper to import existing `localStorage` entries.
**Testing:** CRUD works against MongoDB Atlas; indexes created; data survives refresh; migration imports old entries.
**Commit:** `feat: MongoDB persistence with Mongoose models and repository layer`

---

### Phase 4 — Redis integration
**Objective:** Add caching + a place for hot data; define invalidation clearly.
**Architecture:** `config/redis.js` (ioredis); a `cache` util (get-or-set with TTL); repositories consult cache first for read-heavy paths.
**Files to create:** `config/redis.js`, `utils/cache.js`, `middleware/cacheControl.js`.
**Cache map & TTL:**
| Cached | Key | TTL | Invalidate on |
|---|---|---|---|
| Active user profile | `user:{id}` | 1h | profile/settings update |
| User session | `sess:{id}` | session TTL | logout |
| Today's reflection | `reflection:{id}:{date}` | until midnight | new entry that day |
| Dashboard summary | `dash:{id}` | 10m | new message/analysis |
| Weekly analytics | `wk:{id}:{weekStart}` | 6h | new entry in week |
| Recent conversations | `recent:{id}` | 5m | new journal/message |
| AI context memory | `ctx:{id}` | 30m | memory update job |
**Invalidation strategy:** write-through for user/settings (update DB then `SET`); event-based delete for derived data (on new message → `DEL dash:{id}`, `DEL reflection:{id}:{today}`, `DEL recent:{id}`); time-based (TTL) for analytics that tolerate slight staleness. Never cache without a documented invalidation trigger.
**API:** unchanged shape; faster.
**Testing:** cache hit/miss logged; stale data cleared on writes; app works with Redis down (cache is optional path, DB is source of truth).
**Commit:** `feat: Redis caching layer with documented TTL and invalidation strategy`

---

### Phase 5 — Authentication (Google OAuth)
**Objective:** Password-less Google sign-in, sessions, protected routes.
**Architecture:** `passport-google-oauth20` (or `google-auth-library`) → issue JWT access (short) + refresh (httpOnly cookie); `Sessions`/`OAuthAccounts` collections; `middleware/auth.js` guards `/api/v1/*` except auth routes.
**Files to create:** server `config/oauth.js`, `routes/v1/authRoutes.js`, `controllers/authController.js`, `middleware/auth.js`, `services/authService.js`; client `pages/{Welcome,Login}.jsx`, `context/AuthContext.jsx`, `hooks/useAuth.js`, `components/ProtectedRoute.jsx`.
**Files to modify:** `App.jsx` router adds public (Welcome/Login) vs protected routes; axios attaches token + refresh-on-401 interceptor.
**DB:** activate Users/OAuthAccounts/Sessions.
**API:** `GET /auth/google`, `GET /auth/google/callback`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`.
**UI:** Welcome page + Login (per warm/dark mockups), profile menu bottom-left (name, email, logout) as in mockups.
**Testing:** login/logout, protected route redirects, token refresh, session revoke on logout.
**Commit:** `feat: Google OAuth, JWT sessions, and protected routes`

---

### Phase 6 — History management (left sidebar)
**Objective:** ChatGPT-style history: grouped, searchable, paginated, with rename/delete/archive/favorite/pin.
**Architecture:** cursor pagination + infinite scroll (React Query `useInfiniteQuery`); debounced search endpoint; optimistic mutations.
**Files to create:** client `features/history/*` (`HistorySidebar`, `HistoryItem`, `HistoryGroup`, `SearchBar`), `hooks/useInfiniteHistory.js`; server search/pagination in `journalRepo`.
**Files to modify:** journal routes add `?cursor&limit&q&filter`.
**DB:** compound index `{userId, updatedAt:-1}`; text index on `title` (+ optional message text).
**API:** `GET /journals?cursor=&limit=&q=&filter=pinned|archived|favorite`, `PATCH /journals/:id` (rename/pin/favorite/archive).
**UI:** left sidebar grouped **Today / Yesterday / Previous 7 Days / Older**, item hover actions, pin section, bottom profile block — matching mockups.
**Testing:** grouping correct across timezones, infinite scroll, search debounced, optimistic rename rolls back on error.
**Commit:** `feat: history sidebar with grouping, search, pagination, and item actions`

---

### Phase 7 — Chat UI redesign (center + right panel)
**Objective:** Turn the single dashboard into the 3-column "Reflect AI" experience.
**Architecture:** `ChatContext`/`useChat`; message list virtualization-ready; markdown rendering; typing/streaming animation; theme tokens drive warm(light)/purple(dark).
**Files to create:** `features/chat/*` (`ChatHeader`, `MessageList`, `MessageBubble`, `Composer`, `TypingIndicator`), `features/insights/*` (`TodaysReflection`, `TodaysProgress` rings, `WeeklyTrend`, `QuickInsights`), `components/ui/*` (Button, Card, Skeleton, EmptyState), `context/ThemeContext.jsx`, `hooks/useTheme.js`.
**Files to modify:** replace `Dashboard.jsx` with `ChatPage.jsx` (3-col: history | conversation | insights); retire old dashboard cards (reuse their logic).
**DB:** none new (uses Journals/JournalMessages/MoodAnalysis).
**API:** `POST /journals/:id/messages` returns streamed AI reply (SSE) + updated insight payload.
**UI:** exact match to mockups — center chat with user (accent) vs AI (neutral) bubbles, timestamps, composer with attach/voice (voice stubbed), auto-scroll; right panel Today's Reflection / Progress rings (Mood, Depth, Streak) / Weekly Trend (Mood/Stress/Energy). Glassmorphism-subtle cards, rounded, premium type, micro-interactions, dark + light. **Reference:** `MainJournalApp-darkmode.png` (dark/purple) and `banani-ui-export-brightmode.zip → MainJournalApp.png` (light/warm).
**Testing:** streaming renders incrementally, markdown safe (sanitized), auto-scroll, theme toggle persists, loading skeletons + empty states, responsive stubs.
**Commit:** `feat: 3-column Reflect AI chat interface with insights panel and theming`

---

### Phase 8 — AI memory & context (the heart of the product)
**Objective:** Make the AI a companion that remembers and grows with the user.
**Architecture:** layered context assembly per turn: (a) rolling **conversation window** (recent messages), (b) **long-term memory summary** from `AIContextMemory` (recurring themes, goals, emotional baseline), (c) **retrieved relevant past entries** (keyword now, embeddings later). A background summarizer condenses old messages into memory. Prompt builder composes a system prompt enforcing empathetic, supportive, non-clinical guidance + crisis/escalation guidance.
**Files to create:** `services/ai/{promptBuilder,memoryService,contextService,summarizer}.js`, `providers/geminiProvider.js` (extend existing), `services/analytics/patternDetection.js` (burnout/stress/positive-trend), `utils/safety.js` (disclaimers, crisis-signal detection → surface professional-help resources).
**Files to modify:** `geminiService.js` → multi-turn, memory-aware, streaming; store `AIConversations` telemetry.
**DB:** `AIContextMemory`, `EmotionHistory`, `ProgressMetrics` written each turn/day.
**API:** `POST /journals/:id/messages` (memory-aware, streamed); `GET /insights/today`; `POST /summaries/{weekly|monthly|yearly}` (scheduled).
**UI:** AI naturally references past entries ("last Thursday you mentioned…"), celebrates streaks/achievements, asks thoughtful follow-ups; visible **non-clinical disclaimer** and a gentle "consider talking to a professional" affordance when distress signals appear.
**Testing:** memory recall across sessions, recurring-theme detection, disclaimer always present, crisis path surfaces resources, token budget capped, graceful fallback to rule engine.
**Commit:** `feat: memory-aware AI companion with long-term context, pattern detection, and safety guidance`

---

### Phase 9 — Analytics dashboard (Trend Analysis page)
**Objective:** The full analytics page from the mockup.
**Architecture:** precomputed aggregates in Weekly/Monthly/YearlyAnalytics; endpoints serve chart-ready data; heavy queries cached (Phase 4).
**Files to create:** `pages/Analytics.jsx`; `features/analytics/*` (GrowthScoreChart, ConsistencyCalendar (GitHub-style), EmotionDistribution, StressTrend, EnergyTrend, SentimentGraph, WordCloud, Milestones, AchievementBadges, LifeTimeline, KeyInsights, DateRangePicker); server `services/analyticsService.js`, `routes/v1/analyticsRoutes.js`; export utils.
**DB:** aggregation pipelines; Achievements/Goals/Habits surfaced.
**API:** `GET /analytics?range=6m|1y|all`, `GET /analytics/consistency`, `GET /analytics/emotions`, `GET /analytics/milestones`, `GET /analytics/export?format=pdf|csv`.
**UI:** match `AnalyticsPageDesktop.png` — stat cards (Total Entries, Consistency, Growth Score, Avg Mood), Overall Growth Score line + Reflection/Consistency/Insights bars, Key Insights, monthly consistency calendar, Emotion Distribution, Stress Trend, Personal Milestones, **Download Analytics Report** (PDF) + CSV. Interactive filtering + date range.
**Testing:** aggregates match raw data, calendar correct per month, PDF/CSV export valid, range filter switches datasets, charts responsive.
**Commit:** `feat: analytics dashboard with trends, consistency calendar, milestones, and PDF/CSV export`

---

### Phase 10 — Settings
**Objective:** Full settings surface.
**Files to create:** `pages/Settings.jsx`, `features/settings/*` (ThemePicker, AIPreferences, NotificationSettings, PrivacySecurity, DataExport, DeleteAccount, Language, AnalysisPreferences); server `routes/v1/settingsRoutes.js`, `controllers/settingsController.js`.
**DB:** UserSettings/UserPreferences.
**API:** `GET/PATCH /settings`, `POST /account/export`, `DELETE /account`, `GET /devices`, `DELETE /devices/:id`.
**UI:** Theme (Dark/Light/System), AI prefs, notifications, privacy/security, delete account (confirm), export journal, manage devices, language, analysis prefs.
**Testing:** theme persists across reload/devices, export produces full archive, delete cascades + revokes sessions, device revoke works.
**Commit:** `feat: settings — theme, AI/notification/privacy preferences, data export, account management`

---

### Phase 11 — Mobile responsive UI
**Objective:** Fully responsive: desktop 3-col, tablet collapsible panels, mobile hamburger + bottom sheet.
**Architecture:** responsive layout primitives + `useMediaQuery`; panels become drawers on small screens; charts use responsive containers.
**Files to create:** `components/layout/{ResponsiveShell,Drawer,BottomSheet,MobileNav}.jsx`, `hooks/useMediaQuery.js`.
**Files to modify:** ChatPage/Analytics/Settings to consume responsive shell.
**UI:** Desktop 3-col; Tablet collapsible sidebar + insights; Mobile hamburger, bottom sheet for insights, responsive charts, adaptive cards, touch-friendly spacing. **Reference:** `AnalyticsPageMobile.png`.
**Testing:** breakpoints (mobile/tablet/desktop), drawers trap focus, charts reflow, touch targets ≥44px, no horizontal scroll.
**Commit:** `feat: full responsive layout with collapsible panels and mobile bottom sheet`

---

### Phase 12 — Performance optimization
**Objective:** Make it fast and cheap at scale.
**Architecture:** code splitting + dynamic imports per route; virtualized message/history lists; React Query caching + optimistic updates; debounced search; image optimization; server compression + Redis (Phase 4); DB indexes (Phase 3) verified with `explain()`.
**Files to modify:** router lazy routes, list virtualization, `lib/queryClient` tuning, `vite.config.js` chunking; server `compression`, pagination limits.
**Testing:** Lighthouse ≥90, bundle analyzed, no N+1 queries, virtualized lists smooth at 1k+ items, optimistic updates reconcile.
**Commit:** `perf: code splitting, list virtualization, query caching, and DB/index tuning`

---

### Phase 13 — Production readiness
**Objective:** Ship safely.
**Architecture:** Dockerized services; MongoDB Atlas + managed Redis; CI/CD; env management; logging + monitoring; security hardening (helmet, CORS allowlist, rate limits, input validation everywhere, secrets in vault/host env).
**Files to create:** `Dockerfile` (client, server), `docker-compose.yml`, `.github/workflows/ci.yml`, `config/logger.js` (pino), health/readiness endpoints, `.env.example` updates.
**Deploy targets (recommended):** Frontend on Vercel/Netlify (static) or same host; API on Render/Railway/Fly/containers; **MongoDB Atlas**; **managed Redis** (Upstash/Redis Cloud); images/CDN as needed.
**Testing:** CI runs lint+tests on PR; containers build; health checks green; rate limits enforced; secrets not in repo; smoke test on staging.
**Commit:** `chore: production hardening — Docker, CI/CD, logging, monitoring, security`

---

## 4. Testing strategy (cross-cutting)
- **Unit:** utils, prompt builder, analytics aggregations, rule engine, cache invalidation logic (Vitest / Jest).
- **Integration:** repositories against a test Mongo (mongodb-memory-server) + Redis; auth flow.
- **API:** Supertest on each route (authz, validation, error shapes).
- **Component:** React Testing Library for chat, history, insights, settings; theme + empty/loading states.
- **E2E (optional):** Playwright happy paths (login → chat → insights → analytics).
Add a `test` script per workspace and wire into CI (Phase 13). Each phase's checklist above is the acceptance gate.

## 5. Security checklist (applied progressively)
JWT + httpOnly refresh cookies · helmet · CORS allowlist · `express-rate-limit` on auth + AI routes · zod validation on every request · Mongoose schema validation · least-privilege DB user · secrets via host env only · no secret logging · encrypt sensitive fields at rest where warranted · password-less (OAuth) so no credential storage.

## 6. AI safety posture (non-negotiable, present from Phase 8)
The companion is **supportive, empathetic, non-clinical**. It always: makes clear it is **not** a substitute for a licensed psychologist/psychiatrist; encourages professional help when distress/crisis signals appear; avoids diagnosis; never reinforces self-destructive patterns; surfaces appropriate resources when warranted. This is enforced in the system prompt and `utils/safety.js`, and covered by tests.

---

## 7. Immediate next step
Per our decision (**roadmap first, then code**), the next action is **Phase 2 — Architecture refactor**: monorepo setup, bug fixes (toast crash, `App.jsx` rename, secret logging), dead-code removal, and folder scaffolding — all with **no change to current behavior**. This is safe, reversible, and sets up MongoDB (Phase 3) and everything after.
