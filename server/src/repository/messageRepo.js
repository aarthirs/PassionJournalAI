import JournalMessage from "../models/JournalMessage.js";

export const listByJournal = (journalId) =>
  JournalMessage.find({ journalId }).sort({ createdAt: 1 });

export const countByJournal = (journalId) =>
  JournalMessage.countDocuments({ journalId });

export const addMessage = ({ journalId, userId, role, content }) =>
  JournalMessage.create({ journalId, userId, role, content });

// Used by the lazy backfill so timestamps can be preserved.
export const addMany = (docs) => JournalMessage.insertMany(docs, { timestamps: false });

export const deleteByJournal = (journalId) => JournalMessage.deleteMany({ journalId });
