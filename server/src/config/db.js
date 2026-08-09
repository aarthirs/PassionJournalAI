import mongoose from "mongoose";
import env from "./env.js";
import logger from "./logger.js";

// True once we have a live connection. Used by dbGuard + /api/health.
export const isDbConnected = () => mongoose.connection.readyState === 1;

const explain = (message) => {
  if (/whitelist|Could not connect to any servers/i.test(message)) {
    logger.error(
      "MongoDB refused the connection. Most likely your IP is not whitelisted in Atlas.\n" +
        "   Fix: Atlas -> Network Access -> Add IP Address -> Allow Access from Anywhere (0.0.0.0/0) for dev,\n" +
        "        then wait until the entry becomes Active."
    );
  } else if (/bad auth|Authentication failed/i.test(message)) {
    logger.error(
      "MongoDB rejected your credentials. Check the username/password inside MONGODB_URI\n" +
        "   (special characters in the password must be URL-encoded)."
    );
  }
};

// Connect with retries. We deliberately DO NOT exit the process on failure:
// the HTTP server stays up so the API can return a clear 503 instead of the
// browser seeing an unexplained proxy error, and it self-heals once the DB
// becomes reachable.
export const connectDB = async ({ retryDelayMs = 5000 } = {}) => {
  if (!env.mongoUri) {
    logger.warn("MONGODB_URI is not set — database features are disabled.");
    return;
  }

  mongoose.connection.on("connected", () => logger.info("MongoDB connected"));
  mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));

  const attempt = async () => {
    try {
      await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 });
    } catch (err) {
      logger.error(`MongoDB connection failed: ${err.message}`);
      explain(err.message);
      logger.warn(`Retrying in ${retryDelayMs / 1000}s...`);
      setTimeout(attempt, retryDelayMs);
    }
  };

  await attempt();
};

export default connectDB;
