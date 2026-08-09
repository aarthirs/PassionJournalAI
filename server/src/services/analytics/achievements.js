import { computeStreak, computeConsistency, computeGrowthScore, computeEmotionDistribution } from "./analyticsEngine.js";

/*
 * Milestone definitions. Each rule is a pure predicate over the user's history,
 * so unlocking is deterministic and testable.
 *
 * Achievements are INSERT-ONLY: once unlocked, the row (and its date) never
 * changes, even if the underlying stat later drops. A "30-day streak" you
 * genuinely earned in July shouldn't vanish because you missed a day in August.
 */

export const DEFINITIONS = [
  { key: "first_entry", title: "First Reflection",
    description: "You started your journaling journey. The hardest entry is always the first.",
    test: (h) => h.length >= 1 },

  { key: "entries_10", title: "Ten Reflections",
    description: "Ten entries in. You're building a real habit of looking inward.",
    test: (h) => h.length >= 10 },

  { key: "entries_50", title: "Fifty Reflections",
    description: "Fifty entries of honest self-reflection. That's genuine commitment.",
    test: (h) => h.length >= 50 },

  { key: "entries_100", title: "One Hundred Reflections",
    description: "A hundred entries. You've built an archive of your own growth.",
    test: (h) => h.length >= 100 },

  { key: "streak_7", title: "7-Day Streak",
    description: "You journaled seven days straight. Consistency like this compounds.",
    test: (h, ctx) => computeStreak(h, ctx.now) >= 7 },

  { key: "streak_30", title: "30-Day Streak",
    description: "Thirty days straight. This shows deep commitment to self-reflection.",
    test: (h, ctx) => computeStreak(h, ctx.now) >= 30 },

  { key: "consistency_90", title: "High Consistency",
    description: "Over 90% journaling frequency maintained. Remarkable dedication.",
    // Guarded by a sample floor so a 2-day-old account can't trivially unlock it.
    test: (h, ctx) => h.length >= 14 && computeConsistency(h, { now: ctx.now }) >= 90 },

  { key: "growth_75", title: "Growth Milestone",
    description: "Your growth score crossed 75. Your personal development is accelerating.",
    test: (h, ctx) => h.length >= 10 && computeGrowthScore(h, { now: ctx.now }).score >= 75 },

  { key: "self_discovery", title: "Self-Discovery",
    description: "You've named eight distinct emotions. That emotional vocabulary is a real skill.",
    test: (h) => computeEmotionDistribution(h, { limit: 50 }).length >= 8 },

  { key: "deep_thinker", title: "Deep Thinker",
    description: "Ten deep reflections recorded. You go beyond surface-level journaling.",
    test: (h) => h.filter((e) => e.analysis?.depth === "Deep").length >= 10 },
];

// Which achievements does this history satisfy that aren't already unlocked?
export const findNewlyUnlocked = (history, unlockedKeys = [], now = new Date()) => {
  const already = new Set(unlockedKeys);
  return DEFINITIONS.filter((d) => !already.has(d.key) && d.test(history, { now })).map((d) => ({
    key: d.key,
    title: d.title,
    description: d.description,
  }));
};

// Not-yet-earned milestones, so the UI can show what's next.
export const getLockedDefinitions = (unlockedKeys = []) => {
  const already = new Set(unlockedKeys);
  return DEFINITIONS.filter((d) => !already.has(d.key)).map(({ key, title, description }) => ({
    key, title, description,
  }));
};
