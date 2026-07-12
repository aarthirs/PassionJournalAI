// ==========================================
// Dashboard Analytics Utilities
// ==========================================

/**
 * Format ISO date -> YYYY-MM-DD
 */
const formatDate = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

/**
 * Current Streak
 * Counts consecutive unique days with entries.
 */
export const getCurrentStreak = (history) => {
  if (!history.length) return 0;

  // Remove duplicate dates
  const uniqueDates = [
    ...new Set(history.map((entry) => formatDate(entry.createdAt))),
  ].sort((a, b) => new Date(b) - new Date(a));

  let streak = 1;

  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const current = new Date(uniqueDates[i]);
    const previous = new Date(uniqueDates[i + 1]);

    const diff =
      (current - previous) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Weekly Trend Chart
 */
export const getWeeklyTrend = (history) => {
  if (!history.length) return [];

  return history
    .slice()
    .reverse()
    .map((entry) => ({
      date: new Date(entry.createdAt).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
        }
      ),
      score: entry.analysis.score,
    }));
};

/**
 * Average Score
 */
export const getAverageScore = (history) => {
  if (!history.length) return 0;

  const total = history.reduce(
    (sum, entry) => sum + entry.analysis.score,
    0
  );

  return Math.round(total / history.length);
};

/**
 * Highest Score
 */
export const getHighestScore = (history) => {
  if (!history.length) return 0;

  return Math.max(
    ...history.map((entry) => entry.analysis.score)
  );
};

/**
 * Best Passion
 */
export const getBestPassion = (history)=> {
  if (!history.length) return "-";

  const frequency = {};

  history.forEach((entry) => {
    const passion = entry.analysis.passion;

    frequency[passion] =
      (frequency[passion] || 0) + 1;
  });

  return Object.keys(frequency).reduce((a, b) =>
    frequency[a] > frequency[b] ? a : b
  );
}

export const getTotalEntries = (history) =>
    history.length;