import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";

import env from "./config/env.js";
import { isDbConnected } from "./config/db.js";
import { isCacheEnabled } from "./config/redis.js";

import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import insightsRoutes from "./routes/insightsRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

import { dbGuard } from "./middleware/dbGuard.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authLimiter, aiLimiter, heavyLimiter, generalLimiter } from "./middleware/rateLimit.js";

const app = express();

// Behind a proxy (Render/Railway/nginx) req.ip must come from X-Forwarded-For,
// otherwise every client looks like the proxy and rate limiting collapses.
if (env.isProd) app.set("trust proxy", 1);

/*
 * Security headers. We're a JSON API consumed by a separate origin in dev, so:
 *  - CSP is left to the static host that serves the built frontend
 *  - COEP off, since we load Google avatar images cross-origin
 */
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(compression());

// Explicit allowlist + credentials, required for our httpOnly auth cookies.
app.use(cors({ origin: env.clientUrl, credentials: true }));

// Cap body size: journals are text, so a 1MB ceiling is generous and stops
// someone posting a huge payload to exhaust memory.
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Liveness + readiness. Reports dependency state so orchestrators can tell
// "process is up" from "process can actually serve traffic".
app.get("/api/health", (req, res) => {
  const db = isDbConnected();
  res.status(db ? 200 : 503).json({
    status: db ? "ok" : "degraded",
    database: db ? "connected" : "disconnected",
    cache: isCacheEnabled() ? "enabled" : "disabled",
    uptime: Math.round(process.uptime()),
  });
});

app.use("/api", generalLimiter);

app.use("/api/v1/auth", authLimiter, dbGuard, authRoutes);
app.use("/api/v1/journals", dbGuard, journalRoutes);
app.use("/api/v1/insights", heavyLimiter, dbGuard, insightsRoutes);
app.use("/api/v1/analytics", heavyLimiter, dbGuard, analyticsRoutes);
app.use("/api/v1/settings", dbGuard, settingsRoutes);
app.use("/api/v1/ai", aiLimiter, aiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
