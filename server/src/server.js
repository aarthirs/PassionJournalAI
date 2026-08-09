import mongoose from "mongoose";
import app from "./app.js";
import env from "./config/env.js";
import logger from "./config/logger.js";
import connectDB from "./config/db.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";

// Listen immediately so the port is always open; a DB outage then surfaces as a
// clear 503 instead of an unexplained connection refusal at the proxy.
const server = app.listen(env.port, () => {
  logger.info(`Server running on http://127.0.0.1:${env.port} [${env.nodeEnv}]`);
});

connectDB();
connectRedis();

/*
 * Graceful shutdown.
 *
 * Container platforms send SIGTERM then SIGKILL after a grace period. Draining
 * in-flight requests and closing DB sockets prevents dropped responses and
 * half-written operations on every deploy.
 */
const shutdown = async (signal) => {
  logger.info(`${signal} received — shutting down gracefully...`);

  const forceExit = setTimeout(() => {
    logger.error("Shutdown timed out; forcing exit.");
    process.exit(1);
  }, 10000);
  forceExit.unref();

  server.close(async () => {
    try {
      await mongoose.connection.close(false);
      await disconnectRedis();
      logger.info("Connections closed. Bye.");
      process.exit(0);
    } catch (err) {
      logger.error(`Error during shutdown: ${err.message}`);
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Log and exit on truly unexpected failures rather than continuing in an
// unknown state — the platform will restart us.
process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
});
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught exception: ${err.message}`);
  logger.error(err.stack);
  process.exit(1);
});
