import { analyzeWithGemini } from "./geminiService.js";
import * as journalRepo from "../repository/journalRepo.js";
import { cacheAside, cacheDel, keys, TTL } from "../utils/cache.js";

// Caching policy lives HERE, in the service layer — not in the repository.
// The repository stays a pure, predictable DB gateway; the service decides
// what is worth caching and when to invalidate it. See explanation in chat.

export const createAnalyzedEntry = async (userId, content) => {
  const analysis = await analyzeWithGemini(content);
  const entry = await journalRepo.createEntry({ userId, content, analysis });

  // A write happened -> the cached list for this user is now stale. Delete it
  // (event-based invalidation) so the next read rebuilds it from the DB.
  await cacheDel(keys.journalList(userId));

  return entry.toClient();
};

export const getEntries = async (userId) => {
  // Cache-aside: serve from Redis if present, otherwise load from Mongo,
  // cache the result, and return it.
  return cacheAside(keys.journalList(userId), TTL.JOURNAL_LIST, async () => {
    const entries = await journalRepo.listByUser(userId);
    return entries.map((e) => e.toClient());
  });
};

export const removeEntry = async (userId, id) => {
  const deleted = await journalRepo.deleteForUser(userId, id);
  if (deleted) {
    await cacheDel(keys.journalList(userId)); // invalidate on delete
  }
  return Boolean(deleted);
};

export const importEntries = async (userId, rawEntries) => {
  const mapped = rawEntries
    .filter((e) => e && (e.journal || e.content))
    .map((e) => ({
      content: e.journal || e.content,
      createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
      analysis: e.analysis || {},
      source: "rule",
    }));

  if (mapped.length === 0) return [];

  const inserted = await journalRepo.bulkInsertForUser(userId, mapped);
  await cacheDel(keys.journalList(userId)); // invalidate after bulk import
  return inserted.map((e) => e.toClient());
};
