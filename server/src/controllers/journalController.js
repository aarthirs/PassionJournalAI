import * as journalService from "../services/journalService.js";
import { validateJournalText } from "../validators/journalValidator.js";

export const createJournal = async (req, res, next) => {
  try {
    const { journalText } = req.body;
    const error = validateJournalText(journalText);
    if (error) return res.status(400).json({ error });

    const entry = await journalService.createAnalyzedEntry(
      req.userId,
      journalText.trim()
    );
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
};

export const listJournals = async (req, res, next) => {
  try {
    const entries = await journalService.getEntries(req.userId);
    res.json(entries);
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
    if (!Array.isArray(entries)) {
      return res.status(400).json({ error: "entries must be an array." });
    }
    const saved = await journalService.importEntries(req.userId, entries);
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};
