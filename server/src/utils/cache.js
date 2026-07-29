import { getRedis } from "../config/redis.js";
import logger from "../config/logger.js";

// Time-to-live (seconds) per cached resource. Central so TTL policy is in one
// place and easy to reason about.
export const TTL = {
  JOURNAL_LIST: 300, // 5 min — safe because we ALSO invalidate on every write
};

// Key builders. Namespacing keys ("journals:<userId>") avoids collisions and
// makes it obvious what a key holds and who it belongs to.
export const keys = {
  journalList: (userId) => `journals:${userId}`,
};

// --- Low-level helpers. Every one is failure-tolerant: if Redis is down or
// disabled, reads behave as a miss and writes are silent no-ops. The database
// is ALWAYS the source of truth; the cache is a bonus, never a dependency. ---

export const cacheGet = async (key) => {
  const redis = getRedis();
  if (!redis) return null; // caching disabled -> always a miss
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
    // "EX" sets an expiry so stale data self-destructs even if we forget to
    // invalidate it — a safety net on top of explicit invalidation.
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

// Cache-aside (a.k.a. lazy-loading) pattern:
//   1. Try the cache.
//   2. On a hit, return it (fast path, no DB).
//   3. On a miss, run loader() to fetch from the DB, store it, then return it.
export const cacheAside = async (key, ttlSeconds, loader) => {
  const cached = await cacheGet(key);
  if (cached !== null) return cached;

  const fresh = await loader();
  await cacheSet(key, fresh, ttlSeconds);
  return fresh;
};
