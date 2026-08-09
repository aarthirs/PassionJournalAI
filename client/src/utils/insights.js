// Derived metrics for the insights panel. Pure functions so they're testable
// and cheap to recompute on render.

const DAY_MS = 86400000;
const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };

/**
 * Last 7 calendar days (oldest -> newest) of mood / stress / energy.
 * Days with multiple entries are averaged; days with none carry null so the
 * chart shows a gap rather than implying a score of zero.
 */
export const buildWeeklySeries = (history = [], now = new Date()) => {
  const today = startOfDay(now);
  const buckets = [];

  for (let i = 6; i >= 0; i--) {
    const day = new Date(today.getTime() - i * DAY_MS);
    buckets.push({
      key: day.getTime(),
      day: day.toLocaleDateString([], { weekday: "short" }),
      entries: [],
    });
  }

  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const e of history) {
    const key = startOfDay(e.createdAt).getTime();
    byKey.get(key)?.entries.push(e);
  }

  const avg = (arr, pick) => {
    const vals = arr.map(pick).filter((v) => typeof v === "number" && !Number.isNaN(v));
    return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null;
  };

  return buckets.map((b) => ({
    day: b.day,
    mood: avg(b.entries, (e) => e.analysis?.score),
    stress: avg(b.entries, (e) => e.analysis?.stress),
    energy: avg(b.entries, (e) => e.analysis?.energy),
    count: b.entries.length,
  }));
};

// Percentage of the last 7 days that have at least one entry.
export const getConsistency = (history = [], now = new Date()) => {
  const today = startOfDay(now).getTime();
  const days = new Set();
  for (const e of history) {
    const k = startOfDay(e.createdAt).getTime();
    if (k <= today && today - k < 7 * DAY_MS) days.add(k);
  }
  return Math.round((days.size / 7) * 100);
};

export const getWeekStats = (series = []) => {
  const moods = series.map((s) => s.mood).filter((v) => v !== null);
  const best = series.reduce(
    (acc, s) => (s.mood !== null && (!acc || s.mood > acc.mood) ? s : acc),
    null
  );
  return {
    avgMood: moods.length ? Math.round(moods.reduce((a, b) => a + b, 0) / moods.length) : 0,
    bestDay: best?.day ?? "—",
    entries: series.reduce((s, d) => s + d.count, 0),
  };
};
