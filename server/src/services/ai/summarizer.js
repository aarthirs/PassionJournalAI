import * as journalService from "../journalService.js";
import * as summaryRepo from "../../repository/summaryRepo.js";
import { buildPatternReport, getRecurringThemes, getRecurringEmotions } from "../analytics/patternDetection.js";
import { generatePeriodSummary } from "../geminiService.js";

// Period boundaries. Weeks start Monday.
export const periodRange = (period, now = new Date()) => {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (period === "weekly") {
    const dow = (start.getDay() + 6) % 7; // Mon=0
    start.setDate(start.getDate() - dow);
  } else if (period === "monthly") {
    start.setDate(1);
  } else if (period === "yearly") {
    start.setMonth(0, 1);
  }

  const end = new Date(start);
  if (period === "weekly") end.setDate(end.getDate() + 7);
  else if (period === "monthly") end.setMonth(end.getMonth() + 1);
  else end.setFullYear(end.getFullYear() + 1);

  return { start, end };
};

const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const mean = (arr) => (arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0);

export const computeStats = (entries) => {
  const nums = (f) => entries.map((e) => e.analysis?.[f]).filter((v) => typeof v === "number");
  const days = new Set(entries.map((e) => startOfDay(e.createdAt).getTime()));
  return {
    entries: entries.length,
    activeDays: days.size,
    avgMood: mean(nums("score")),
    avgStress: mean(nums("stress")),
    avgEnergy: mean(nums("energy")),
    topTheme: getRecurringThemes(entries, { days: 400, limit: 1 })[0]?.label || "",
    topEmotion: getRecurringEmotions(entries, { days: 400, limit: 1 })[0]?.label || "",
  };
};

/**
 * Returns the stored summary for the current period, generating it if missing
 * (or if `force` is set). Cached in Mongo rather than regenerated per request —
 * a summary is expensive and stable within its period.
 */
export const getOrCreateSummary = async (userId, period, { force = false, now = new Date() } = {}) => {
  const { start, end } = periodRange(period, now);

  if (!force) {
    const existing = await summaryRepo.findForPeriod(userId, period, start);
    if (existing) return existing.toClient();
  }

  const history = await journalService.getEntries(userId);
  const entries = history.filter((e) => {
    const t = new Date(e.createdAt).getTime();
    return t >= start.getTime() && t < end.getTime();
  });

  if (entries.length === 0) return null; // nothing to summarize yet

  const stats = computeStats(entries);
  const patterns = buildPatternReport(history, now);
  const { content, highlights, source } = await generatePeriodSummary({ period, stats, patterns, entries });

  const saved = await summaryRepo.upsert({
    userId, period, periodStart: start, periodEnd: end,
    content, highlights, stats, source,
  });

  return saved.toClient();
};
