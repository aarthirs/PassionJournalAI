import * as journalService from "../journalService.js";
import * as achievementRepo from "../../repository/achievementRepo.js";
import { buildAnalytics, buildMonthCalendar, filterByRange } from "./analyticsEngine.js";
import { findNewlyUnlocked, getLockedDefinitions } from "./achievements.js";
import { journalsToCsv } from "../../utils/csv.js";
import { cacheAside, keys, TTL } from "../../utils/cache.js";
import logger from "../../config/logger.js";

/**
 * Full analytics payload for a range.
 *
 * Cached per (user, range): the computation walks the whole history, and people
 * reload this page far more often than they add entries. Any write invalidates
 * it via journalService/chatService.
 */
export const getAnalytics = async (userId, range = "1y") => {
  return cacheAside(keys.analytics(userId, range), TTL.ANALYTICS, async () => {
    const history = await journalService.getEntries(userId);
    const report = buildAnalytics(history, { range });

    // Milestones are a motivational extra: if anything here fails, the analytics
    // page must still render. Isolated so it can degrade rather than 500.
    let achievements = [];
    let lockedAchievements = [];
    let newlyUnlocked = [];

    try {
      const existing = await achievementRepo.listForUser(userId);
      const newly = findNewlyUnlocked(history, existing.map((a) => a.key));

      if (newly.length) await achievementRepo.insertNew(userId, newly);

      const all = newly.length ? await achievementRepo.listForUser(userId) : existing;
      achievements = all.map((a) => a.toClient());
      lockedAchievements = getLockedDefinitions(all.map((a) => a.key)).slice(0, 3);
      newlyUnlocked = newly.map((n) => n.key);
    } catch (err) {
      logger.warn(`Achievements unavailable for this request: ${err.message}`);
    }

    return { ...report, achievements, lockedAchievements, newlyUnlocked };
  });
};

// Calendar for an arbitrary month (the page lets you step back through months).
export const getCalendar = async (userId, { year, month }) => {
  const history = await journalService.getEntries(userId);
  return buildMonthCalendar(history, { year, month });
};

export const exportCsv = async (userId, range = "all") => {
  const history = await journalService.getEntries(userId);
  return journalsToCsv(filterByRange(history, range));
};
