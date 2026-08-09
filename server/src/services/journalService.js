import { analyzeWithGemini } from "./geminiService.js";
import * as journalRepo from "../repository/journalRepo.js";
import * as messageRepo from "../repository/messageRepo.js";
import { cacheAside, cacheDel, keys, TTL } from "../utils/cache.js";

// Every write touches these derived caches, so invalidate them together.
const invalidateUser = (userId, limit = 20) =>
  cacheDel(
    keys.journalList(userId),
    keys.journalFirstPage(userId, limit),
    keys.pinned(userId),
    keys.patterns(userId)
  );

export const createAnalyzedEntry = async (userId, content) => {
  const analysis = await analyzeWithGemini(content);
  const entry = await journalRepo.createEntry({ userId, content, analysis });
  await invalidateUser(userId);
  return entry.toClient();
};

/**
 * Paginated history.
 *
 * CACHING NOTE (key cardinality): caching every combination of
 * cursor + search term + filter would create effectively unlimited keys, each
 * with a low hit rate — that wastes memory and buys almost nothing. So we cache
 * ONLY the first page of the default view, which is what nearly every session
 * requests first, and read straight from MongoDB for deeper pages, searches,
 * and filters. Cache what is hot and repeated, not everything.
 */
export const getHistoryPage = async (userId, { cursor, limit = 20, q, filter } = {}) => {
  const isDefaultFirstPage = !cursor && !q && !filter;

  const load = async () => {
    const { items, nextCursor } = await journalRepo.listPage(userId, { cursor, limit, q, filter });
    return { items: items.map((e) => e.toClient()), nextCursor };
  };

  if (!isDefaultFirstPage) return load();

  return cacheAside(keys.journalFirstPage(userId, limit), TTL.JOURNAL_FIRST_PAGE, load);
};

export const getPinned = async (userId) =>
  cacheAside(keys.pinned(userId), TTL.PINNED, async () => {
    const items = await journalRepo.listPinned(userId);
    return items.map((e) => e.toClient());
  });

export const updateEntry = async (userId, id, fields) => {
  const updated = await journalRepo.updateForUser(userId, id, fields);
  if (!updated) return null;
  await invalidateUser(userId);
  return updated.toClient();
};

export const removeEntry = async (userId, id) => {
  const deleted = await journalRepo.deleteForUser(userId, id);
  if (deleted) {
    // Cascade: a thread's messages must not outlive the thread.
    await messageRepo.deleteByJournal(deleted._id);
    await invalidateUser(userId);
  }
  return Boolean(deleted);
};

// Kept for the dashboard widgets (streak / weekly trend), which need the full
// recent set rather than a page.
export const getEntries = async (userId) =>
  cacheAside(keys.journalList(userId), TTL.JOURNAL_LIST, async () => {
    const { items } = await journalRepo.listPage(userId, { limit: 200, includePinned: true });
    return items.map((e) => e.toClient());
  });

export const importEntries = async (userId, rawEntries) => {
  const mapped = rawEntries
    .filter((e) => e && (e.journal || e.content))
    .map((e) => ({
      content: e.journal || e.content,
      title: e.title || "",
      createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
      analysis: e.analysis || {},
      source: "rule",
    }));
  if (mapped.length === 0) return [];
  const inserted = await journalRepo.bulkInsertForUser(userId, mapped);
  await invalidateUser(userId);
  return inserted.map((e) => e.toClient());
};
