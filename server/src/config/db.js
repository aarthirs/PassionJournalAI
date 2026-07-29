import mongoose from "mongoose";
import env from "./env.js";
import logger from "./logger.js";

// Connect to MongoDB. The DB is the single source of truth (Redis, added in
// Phase 4, is only a cache in front of this).
export const connectDB = async () => {
  if (!env.mongoUri) {
    logger.warn("MONGODB_URI is not set — journal endpoints will fail until it is configured.");
    return;
  }

  mongoose.connection.on("connected", () => logger.info("MongoDB connected"));
  mongoose.connection.on("error", (e) => logger.error("MongoDB error:", e.message));
  mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));

  // Fail fast if the cluster is unreachable instead of hanging forever.
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 });
};

export default connectDB;
