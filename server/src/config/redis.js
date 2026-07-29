import Redis from "ioredis";
import env from "./env.js";
import logger from "./logger.js";

// Single shared Redis client for the whole process. Kept in module scope so
// every import of getRedis() sees the same connection (connection pooling is
// handled internally by ioredis).
let client = null;

export const connectRedis = () => {
  // Caching is OPTIONAL. With no REDIS_URL we simply never create a client;
  // the cache helpers then treat every lookup as a miss and the app runs
  // straight off MongoDB. This is deliberate graceful degradation.
  if (!env.redisUrl) {
    logger.warn("REDIS_URL not set — caching disabled (serving directly from MongoDB).");
    return null;
  }

  client = new Redis(env.redisUrl, {
    // Don't let a slow/unreachable Redis hang API requests forever.
    maxRetriesPerRequest: 2,
    // Back off between reconnection attempts instead of hammering the server.
    retryStrategy: (times) => Math.min(times * 200, 2000),
  });

  client.on("connect", () => logger.info("Redis connected"));
  // IMPORTANT: handle 'error' so a Redis outage logs a warning instead of
  // throwing an unhandled exception that crashes the Node process.
  client.on("error", (e) => logger.warn("Redis error:", e.message));

  return client;
};

// Returns the client, or null when caching is disabled/unavailable.
export const getRedis = () => client;

export const disconnectRedis = async () => {
  if (client) {
    await client.quit();
    client = null;
  }
};
