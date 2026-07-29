import express from "express";
import cors from "cors";

import aiRoutes from "./routes/aiRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Versioned API.
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/journals", journalRoutes);

// Must stay last.
app.use(notFound);
app.use(errorHandler);

export default app;
