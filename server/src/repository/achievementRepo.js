import Achievement from "../models/Achievement.js";
import logger from "../config/logger.js";

export const listForUser = (userId) =>
  Achievement.find({ userId }).sort({ achievedAt: -1 });

/**
 * Insert-only, and deliberately NEVER throws.
 *
 * Achievements are a motivational extra. If two requests race (React dev mode
 * double-invokes effects, so this genuinely happens), both compute the same
 * unlock list and one hits the unique index. That must not turn into a 500 on
 * the analytics page, so every failure here is logged and swallowed.
 */
export const insertNew = async (userId, items) => {
  if (!items?.length) return [];
  try {
    return await Achievement.insertMany(
      items.map((i) => ({ ...i, userId, achievedAt: new Date() })),
      { ordered: false }
    );
  } catch (err) {
    logger.warn(`Achievement insert skipped: ${err.message}`);
    return [];
  }
};
