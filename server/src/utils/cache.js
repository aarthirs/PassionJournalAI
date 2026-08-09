import { getRedis } from "../config/redis.js";
import logger from "../config/logger.js";

export const TTL = {
  JOURNAL_LIST: 300,   // 5 min — also invalidated on every write
  JOURNAL_FIRST_PAGE: 120,
  PINNED: 300,
  PATTERNS: 180,
  ANALYTICS: 300,   // 5 min — whole-history computation, read far more than written   // 3 min — recomputed from history, cheap to refresh
};

export const keys = {
  journalList: (userId) => `journals:${userId}`,
  // Only the FIRST page of the default view is cached (see note in service).
  journalFirstPage: (userId, limit) => `journals:${userId}:page1:${limit}`,
  pinned: (userId) => `journals:${userId}:pinned`,
  patterns: (userId) => `insights:${userId}:patterns`,
  analytics: (userId, range) => `analytics:${userId}:${range}`,
};

// Every helper is failure-tolerant: if Redis is disabled or erroring, reads
// behave as a miss and writes are no-ops. MongoDB is always the source of truth.

export const cacheGet = async (key) => {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    logger.warn("cache get failed:", e.message);
    return null;
  }
};

export const cacheSet = async (key, value, ttlSeconds) => {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (e) {
    logger.warn("cache set failed:", e.message);
  }
};

export const cacheDel = async (...keysToDelete) => {
  const redis = getRedis();
  if (!redis || keysToDelete.length === 0) return;
  try {
    await redis.del(...keysToDelete);
  } catch (e) {
    logger.warn("cache del failed:", e.message);
  }
};

export const cacheAside = async (key, ttlSeconds, loader) => {
  const cached = await cacheGet(key);
  if (cached !== null) return cached;
  const fresh = await loader();
  await cacheSet(key, fresh, ttlSeconds);
  return fresh;
};
