import JournalEntry from "../models/JournalEntry.js";

// The repository is the ONLY layer that talks to the Mongoose model.
// Services and controllers never import the model directly — this is what
// keeps the data store swappable and the business logic testable.

export const createEntry = ({ userId, content, analysis }) =>
  JournalEntry.create({ userId, content, analysis });

export const listByUser = (userId, { limit = 200 } = {}) =>
  JournalEntry.find({ userId }).sort({ createdAt: -1 }).limit(limit);

export const findByIdForUser = (userId, id) =>
  JournalEntry.findOne({ _id: id, userId });

export const deleteForUser = (userId, id) =>
  JournalEntry.findOneAndDelete({ _id: id, userId });

// Migration path from localStorage. timestamps:false so we PRESERVE each
// entry's original createdAt (otherwise the trend chart would collapse them
// all to "today").
export const bulkInsertForUser = (userId, entries) =>
  JournalEntry.insertMany(
    entries.map((e) => ({
      userId,
      content: e.content,
      analysis: e.analysis || {},
      source: e.source || "rule",
      createdAt: e.createdAt || new Date(),
      updatedAt: e.createdAt || new Date(),
    })),
    { ordered: false, timestamps: false }
  );
