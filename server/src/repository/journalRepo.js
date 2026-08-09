import JournalEntry from "../models/JournalEntry.js";
import { decodeCursor, cursorFilter, encodeCursor } from "../utils/cursor.js";

// Escape user input before using it in a regex, otherwise characters like
// "(" or "*" would either crash the query or let a user craft an expensive one.
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createEntry = ({ userId, content, analysis }) =>
  JournalEntry.create({ userId, content, analysis });

export const findByIdForUser = (userId, id) =>
  JournalEntry.findOne({ _id: id, userId });

export const deleteForUser = (userId, id) =>
  JournalEntry.findOneAndDelete({ _id: id, userId });

// Only these fields may be changed through the update API. Whitelisting
// prevents a client from patching userId, analysis, createdAt, etc.
const UPDATABLE = ["title", "pinned", "favorite", "archived"];

export const updateForUser = (userId, id, fields) => {
  const update = {};
  for (const key of UPDATABLE) {
    if (fields[key] !== undefined) update[key] = fields[key];
  }
  if (Object.keys(update).length === 0) return null;
  return JournalEntry.findOneAndUpdate({ _id: id, userId }, update, { new: true });
};

/**
 * One page of history, newest first.
 * filter: undefined | "archived" | "favorite"
 * When browsing the default view we hide archived entries and hide pinned ones
 * (they render in their own section), but a search looks at everything except
 * archived so results are never mysteriously missing.
 */
export const listPage = async (
  userId,
  { cursor, limit = 20, q = "", filter, includePinned = false } = {}
) => {
  const query = { userId };

  if (filter === "archived") query.archived = true;
  else query.archived = { $ne: true };

  if (filter === "favorite") query.favorite = true;

  const searching = Boolean(q && q.trim());
  if (searching) {
    const rx = new RegExp(escapeRegex(q.trim()), "i");
    query.$and = [{ $or: [{ title: rx }, { content: rx }] }];
  }

  // In the default browse view, pinned entries render in their own section, so
  // exclude them here to avoid showing the same entry twice. Searches, filtered
  // views, and full-dataset reads (analytics) all keep them.
  if (!searching && !filter && !includePinned) {
    query.pinned = { $ne: true };
  }

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      const cf = cursorFilter(decoded);
      query.$and = query.$and ? [...query.$and, cf] : [cf];
    }
  }

  // Fetch one extra document to know whether another page exists without
  // running a second count query.
  const docs = await JournalEntry.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1);

  const hasMore = docs.length > limit;
  const items = hasMore ? docs.slice(0, limit) : docs;

  return {
    items,
    nextCursor: hasMore && items.length ? encodeCursor(items[items.length - 1]) : null,
  };
};

// Pinned list is intentionally unpaginated — it's meant to stay small.
export const listPinned = (userId) =>
  JournalEntry.find({ userId, pinned: true, archived: { $ne: true } })
    .sort({ updatedAt: -1 })
    .limit(50);

export const bulkInsertForUser = (userId, entries) =>
  JournalEntry.insertMany(
    entries.map((e) => ({
      userId,
      content: e.content,
      title: e.title || "",
      analysis: e.analysis || {},
      source: e.source || "rule",
      createdAt: e.createdAt || new Date(),
      updatedAt: e.createdAt || new Date(),
    })),
    { ordered: false, timestamps: false }
  );
