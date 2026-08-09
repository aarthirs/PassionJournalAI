import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import env from "./config/env.js";
import { isDbConnected } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import insightsRoutes from "./routes/insightsRoutes.js";
import { dbGuard } from "./middleware/dbGuard.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Readiness endpoint: reports whether dependencies are actually usable.
app.get("/api/health", (req, res) => {
  const db = isDbConnected();
  res.status(db ? 200 : 503).json({
    status: db ? "ok" : "degraded",
    database: db ? "connected" : "disconnected",
  });
});

// dbGuard fails fast with a clear 503 when Mongo is unreachable. Applied to
// auth too, so clicking "Continue with Google" tells you the DB is down
// instead of bouncing through Google and failing at the callback.
app.use("/api/v1/auth", dbGuard, authRoutes);
app.use("/api/v1/journals", dbGuard, journalRoutes);
app.use("/api/v1/insights", dbGuard, insightsRoutes);
app.use("/api/v1/ai", aiRoutes); // stateless, no DB needed

app.use(notFound);
app.use(errorHandler);

export default app;
