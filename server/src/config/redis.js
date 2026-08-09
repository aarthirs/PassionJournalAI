import Redis from "ioredis";
import env from "./env.js";
import logger from "./logger.js";

let client = null;
let disabled = false;
let warned = false;

const MAX_CONNECT_ATTEMPTS = 3;

export const connectRedis = () => {
  if (!env.redisUrl) {
    logger.warn("REDIS_URL not set — caching disabled (serving directly from MongoDB).");
    disabled = true;
    return null;
  }

  client = new Redis(env.redisUrl, {
    maxRetriesPerRequest: 1,
    // Do NOT queue commands while offline: without this, every cache call waits
    // on a dead socket and adds latency to real requests.
    enableOfflineQueue: false,
    lazyConnect: false,
    /*
     * Give up after a few attempts instead of reconnecting forever.
     * Returning null tells ioredis to stop retrying — which is what silences the
     * endless "ECONNREFUSED" spam when no Redis is running locally. Caching is an
     * optional accelerator, so the right behaviour is to switch it off cleanly
     * rather than retry in a loop for the lifetime of the process.
     */
    retryStrategy: (times) => {
      if (times > MAX_CONNECT_ATTEMPTS) {
        if (!warned) {
          logger.warn(
            "Redis unreachable — caching is now DISABLED for this run; MongoDB serves everything.\n" +
              "   This is safe. To silence it, remove REDIS_URL from server/.env, or start a Redis instance."
          );
          warned = true;
        }
        disabled = true;
        try { client?.disconnect(); } catch { /* already closed */ }
        client = null;
        return null; // stop retrying
      }
      return Math.min(times * 300, 1000);
    },
  });

  client.on("connect", () => {
    disabled = false;
    warned = false;
    logger.info("Redis connected");
  });

  // Log connection errors ONCE rather than on every retry tick.
  client.on("error", (e) => {
    if (!warned) {
      logger.warn(`Redis error: ${e.message} (will disable caching if it persists)`);
      warned = true;
    }
  });

  return client;
};

// Returns null when caching is unavailable, which every cache helper treats as a miss.
export const getRedis = () => (disabled ? null : client);

export const isCacheEnabled = () => Boolean(getRedis());

export const disconnectRedis = async () => {
  if (client) {
    try { await client.quit(); } catch { /* ignore */ }
    client = null;
  }
};
