import express from "express";
import cors from "cors";

import aiRoutes from "./routes/aiRoutes.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

// Lightweight health check (used by monitoring in Phase 13).
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Versioned API. Everything moves under /api/v1 so we can evolve without breaking clients.
app.use("/api/v1/ai", aiRoutes);

// Must be last: unknown route -> 404, then centralized error handler.
app.use(notFound);
app.use(errorHandler);

export default app;
