import * as journalService from "../services/journalService.js";
import {
  validateJournalText,
  validateEntryUpdate,
} from "../validators/journalValidator.js";

const MAX_LIMIT = 50;

export const createJournal = async (req, res, next) => {
  try {
    const { journalText } = req.body;
    const error = validateJournalText(journalText);
    if (error) return res.status(400).json({ error });

    const entry = await journalService.createAnalyzedEntry(req.userId, journalText.trim());
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
};

// GET /journals?cursor=&limit=&q=&filter=
// Returns { items, nextCursor } — the shape the infinite-scroll hook expects.
export const listJournals = async (req, res, next) => {
  try {
    const { cursor, q, filter } = req.query;
    const limit = Math.min(Number(req.query.limit) || 20, MAX_LIMIT);
    const allowed = ["archived", "favorite"];
    const page = await journalService.getHistoryPage(req.userId, {
      cursor,
      limit,
      q,
      filter: allowed.includes(filter) ? filter : undefined,
    });
    res.json(page);
  } catch (err) {
    next(err);
  }
};

export const listPinnedJournals = async (req, res, next) => {
  try {
    res.json(await journalService.getPinned(req.userId));
  } catch (err) {
    next(err);
  }
};

// Full recent set for dashboard widgets (streak, weekly trend).
export const listAllJournals = async (req, res, next) => {
  try {
    res.json(await journalService.getEntries(req.userId));
  } catch (err) {
    next(err);
  }
};

// PATCH /journals/:id — rename, pin, favorite, archive.
export const updateJournal = async (req, res, next) => {
  try {
    const { error, fields } = validateEntryUpdate(req.body);
    if (error) return res.status(400).json({ error });

    const updated = await journalService.updateEntry(req.userId, req.params.id, fields);
    if (!updated) return res.status(404).json({ error: "Entry not found." });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteJournal = async (req, res, next) => {
  try {
    const ok = await journalService.removeEntry(req.userId, req.params.id);
    if (!ok) return res.status(404).json({ error: "Entry not found." });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const importJournals = async (req, res, next) => {
  try {
    const { entries } = req.body;
    if (!Array.isArray(entries)) return res.status(400).json({ error: "entries must be an array." });
    res.status(201).json(await journalService.importEntries(req.userId, entries));
  } catch (err) {
    next(err);
  }
};
