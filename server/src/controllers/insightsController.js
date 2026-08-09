import * as journalService from "../services/journalService.js";
import { buildPatternReport } from "../services/analytics/patternDetection.js";
import { getMemory } from "../services/ai/memoryService.js";
import { getOrCreateSummary } from "../services/ai/summarizer.js";
import { cacheAside, keys, TTL } from "../utils/cache.js";

const PERIODS = ["weekly", "monthly", "yearly"];

// GET /insights/patterns
export const getPatterns = async (req, res, next) => {
  try {
    const data = await cacheAside(keys.patterns(req.userId), TTL.PATTERNS, async () => {
      const [history, memory] = await Promise.all([
        journalService.getEntries(req.userId),
        getMemory(req.userId),
      ]);

      const report = buildPatternReport(history);
      return {
        ...report,
        // Memory-derived context the UI can show as "what I remember".
        goals: (memory?.goals || []).filter((g) => g.status === "active").map((g) => g.text),
        baseline: memory?.baseline || null,
        hasMemory: Boolean(memory?.summary),
      };
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// GET /insights/summary?period=weekly  (POST same path to force regeneration)
export const getSummary = async (req, res, next) => {
  try {
    const period = PERIODS.includes(req.query.period) ? req.query.period : "weekly";
    const force = req.method === "POST";
    const summary = await getOrCreateSummary(req.userId, period, { force });

    if (!summary) {
      return res.status(200).json({ summary: null, message: "Not enough entries yet for this period." });
    }
    res.json({ summary });
  } catch (err) {
    next(err);
  }
};
