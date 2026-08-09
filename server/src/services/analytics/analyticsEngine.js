/*
 * Analytics computation. Pure functions over an entry array — no DB, no AI.
 *
 * Everything the Trend Analysis page shows is derived here so it can be unit
 * tested. Same principle as patternDetection: a dashboard that quietly reports
 * wrong numbers about someone's life is worse than one that says "no data".
 */

const DAY = 86400000;
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const dayKey = (d) => startOfDay(d).getTime();

const mean = (arr) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0);
const round = (n) => Math.round(n);
const pick = (entries, field) =>
  entries.map((e) => e.analysis?.[field]).filter((v) => typeof v === "number" && !Number.isNaN(v));

// ---------- range ----------

export const RANGES = { "6m": 182, "1y": 365, all: null };

export const filterByRange = (history = [], range = "1y", now = new Date()) => {
  const days = RANGES[range];
  if (!days) return [...history];
  const cutoff = now.getTime() - days * DAY;
  return history.filter((e) => new Date(e.createdAt).getTime() >= cutoff);
};

// ---------- consistency ----------

/**
 * Share of days in the window that have at least one entry.
 * `windowDays` is capped by how long the person has actually been journaling,
 * so someone 3 days in isn't punished for the other 27 days of a 30-day window.
 */
export const computeConsistency = (entries, { windowDays = 30, now = new Date() } = {}) => {
  if (entries.length === 0) return 0;

  const oldest = Math.min(...entries.map((e) => new Date(e.createdAt).getTime()));
  const daysSinceStart = Math.floor((startOfDay(now).getTime() - startOfDay(oldest).getTime()) / DAY) + 1;
  const span = Math.max(1, Math.min(windowDays, daysSinceStart));

  const cutoff = startOfDay(now).getTime() - (span - 1) * DAY;
  const activeDays = new Set(
    entries.filter((e) => dayKey(e.createdAt) >= cutoff).map((e) => dayKey(e.createdAt))
  ).size;

  return Math.min(100, round((activeDays / span) * 100));
};

export const computeStreak = (entries, now = new Date()) => {
  if (entries.length === 0) return 0;

  const days = [...new Set(entries.map((e) => dayKey(e.createdAt)))].sort((a, b) => b - a);
  const today = startOfDay(now).getTime();

  // A streak stays alive if the latest entry is today or yesterday.
  if (days[0] !== today && days[0] !== today - DAY) return 0;

  let streak = 1;
  for (let i = 0; i < days.length - 1; i++) {
    if (days[i] - days[i + 1] === DAY) streak++;
    else break;
  }
  return streak;
};

// ---------- growth score ----------

/**
 * Composite 0-100 "growth score".
 *
 * Weighting is a PRODUCT decision, stated explicitly rather than hidden:
 *   40% mood            — how you've actually felt
 *   35% consistency     — showing up is the habit that compounds
 *   25% reflection depth— shallow daily notes shouldn't score like real reflection
 *
 * Sub-scores are returned too, so the UI can show WHY the number is what it is
 * instead of presenting an unexplainable figure about someone's life.
 */
export const computeGrowthScore = (entries, { now = new Date() } = {}) => {
  if (entries.length === 0) {
    return { score: 0, reflectionQuality: 0, consistency: 0, insights: 0, hasData: false };
  }

  const avgMood = mean(pick(entries, "score"));
  const avgDepth = mean(pick(entries, "depthScore"));
  const consistency = computeConsistency(entries, { now });

  // "Insights" = how much of the reflection is substantive: depth blended with
  // how often the AI produced a usable reflection at all.
  const withReflection = entries.filter((e) => (e.analysis?.reflection || "").length > 40).length;
  const insights = round(avgDepth * 0.6 + (withReflection / entries.length) * 100 * 0.4);

  return {
    score: round(avgMood * 0.4 + consistency * 0.35 + avgDepth * 0.25),
    reflectionQuality: round(avgDepth),
    consistency,
    insights,
    hasData: true,
  };
};

// Monthly growth-score series for the trend line (oldest -> newest).
export const buildGrowthSeries = (entries, { months = 7, now = new Date() } = {}) => {
  const series = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    const inMonth = entries.filter((e) => {
      const t = new Date(e.createdAt).getTime();
      return t >= monthStart.getTime() && t < monthEnd.getTime();
    });

    series.push({
      month: monthStart.toLocaleDateString("en-GB", { month: "short" }),
      // null (not 0) for months with no entries so the chart shows a gap.
      score: inMonth.length ? computeGrowthScore(inMonth, { now: monthEnd }).score : null,
      entries: inMonth.length,
    });
  }
  return series;
};

// Change in growth score: this month vs last month.
export const computeMonthlyDelta = (entries, now = new Date()) => {
  const thisStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();

  const inRange = (from, to) =>
    entries.filter((e) => {
      const t = new Date(e.createdAt).getTime();
      return t >= from && t < to;
    });

  const current = inRange(thisStart, now.getTime() + 1);
  const previous = inRange(lastStart, thisStart);
  if (!current.length || !previous.length) return null;

  return computeGrowthScore(current, { now }).score - computeGrowthScore(previous, { now: new Date(thisStart) }).score;
};

// ---------- calendar ----------

/**
 * GitHub-style month grid. Returns 7-column weeks padded with nulls so the
 * first day lands under the correct weekday header (Sunday-first, per mockup).
 */
export const buildMonthCalendar = (entries, { year, month, now = new Date() } = {}) => {
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth();

  const first = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const counts = new Map();
  for (const e of entries) {
    const d = new Date(e.createdAt);
    if (d.getFullYear() === y && d.getMonth() === m) {
      counts.set(d.getDate(), (counts.get(d.getDate()) || 0) + 1);
    }
  }

  const cells = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null); // leading blanks
  for (let day = 1; day <= daysInMonth; day++) {
    const count = counts.get(day) || 0;
    cells.push({
      day,
      count,
      // 0-3 intensity buckets for the heatmap shading.
      level: count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3,
    });
  }
  while (cells.length % 7 !== 0) cells.push(null); // trailing blanks

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const total = [...counts.values()].reduce((s, v) => s + v, 0);
  const activeDays = counts.size;

  return {
    year: y,
    month: m,
    label: first.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
    weeks,
    totalEntries: total,
    activeDays,
    // Average per ACTIVE day — "2.1 per day" should not be diluted by days off.
    avgPerDay: activeDays ? Math.round((total / activeDays) * 10) / 10 : 0,
  };
};

// ---------- distributions ----------

export const computeEmotionDistribution = (entries, { limit = 6 } = {}) => {
  const counts = new Map();
  let total = 0;

  for (const e of entries) {
    const raw = e.analysis?.emotion;
    if (!raw || typeof raw !== "string" || !raw.trim()) continue;
    const label = raw.trim();
    const key = label.toLowerCase();
    const prev = counts.get(key);
    counts.set(key, { label, count: (prev?.count || 0) + 1 });
    total++;
  }
  if (total === 0) return [];

  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((x) => ({ label: x.label, count: x.count, percent: Math.round((x.count / total) * 100) }));
};

// Simple trend for a numeric field: recent third vs earliest third of the range.
export const computeFieldTrend = (entries, field, { higherIsBetter = true } = {}) => {
  const vals = pick(entries, field);
  if (vals.length === 0) return { current: 0, delta: null, direction: "insufficient", hasData: false };

  const current = mean(vals);
  if (vals.length < 6) {
    return { current: round(current), delta: null, direction: "baseline", hasData: true };
  }

  // entries arrive newest-first
  const third = Math.floor(vals.length / 3);
  const recent = mean(vals.slice(0, third));
  const earliest = mean(vals.slice(-third));
  const delta = round(recent - earliest);

  let direction = "stable";
  if (Math.abs(delta) >= 5) {
    const rising = delta > 0;
    direction = (rising && higherIsBetter) || (!rising && !higherIsBetter) ? "improving" : "worsening";
  }
  return { current: round(current), delta, direction, hasData: true };
};

// ---------- word cloud ----------

const STOP = new Set(`the a an and or but if then than that this these those is am are was were be been
being do does did doing have has had having of to in on at for with about from as so just really very
much more most some any not no can could would should will i me my myself we our you your it they them
he she there here what when where who how why all also too own same day today feel felt feeling like
was were im ive dont cant didnt thats got get going went even still back way things thing lot bit`.split(/\s+/));

export const computeWordFrequency = (entries, { limit = 30, minCount = 2 } = {}) => {
  const counts = new Map();

  for (const e of entries) {
    const words = String(e.journal || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s']/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w));

    for (const w of words) counts.set(w, (counts.get(w) || 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, c]) => c >= minCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
};

// ---------- key insights ----------

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Plain-language observations. Each is only emitted when actually supported.
export const buildKeyInsights = (entries, { now = new Date() } = {}) => {
  const out = [];
  if (entries.length < 3) return out;

  // Most reflective weekday (needs a real sample to be meaningful).
  const byDow = new Map();
  for (const e of entries) {
    const d = new Date(e.createdAt).getDay();
    byDow.set(d, (byDow.get(d) || 0) + 1);
  }
  if (entries.length >= 7) {
    const [dow, count] = [...byDow.entries()].sort((a, b) => b[1] - a[1])[0];
    const weeks = Math.max(1, Math.ceil(entries.length / 7));
    out.push(`${WEEKDAYS[dow]}s are your most reflective days (${(count / weeks).toFixed(1)} avg entries).`);
  }

  // Do deeper entries coincide with better mood?
  const deep = entries.filter((e) => e.analysis?.depth === "Deep");
  const shallow = entries.filter((e) => e.analysis?.depth === "Light");
  if (deep.length >= 3 && shallow.length >= 3) {
    const dm = mean(pick(deep, "score"));
    const sm = mean(pick(shallow, "score"));
    if (dm - sm >= 5) {
      out.push(`Your mood averages ${round(dm - sm)} points higher after deeper reflections.`);
    }
  }

  const streak = computeStreak(entries, now);
  if (streak >= 3) out.push(`Consistency streak: ${streak} days and counting.`);

  const emo = computeEmotionDistribution(entries, { limit: 1 })[0];
  if (emo && emo.percent >= 25) {
    out.push(`${emo.label} is your most frequent emotion (${emo.percent}% of entries).`);
  }

  return out;
};

// ---------- top-level report ----------

export const buildAnalytics = (history = [], { range = "1y", now = new Date() } = {}) => {
  const entries = filterByRange(history, range, now);

  const growth = computeGrowthScore(entries, { now });
  const moodVals = pick(entries, "score");

  return {
    range,
    generatedAt: now,
    hasData: entries.length > 0,
    stats: {
      totalEntries: entries.length,
      consistency: computeConsistency(entries, { now }),
      growthScore: growth.score,
      growthDelta: computeMonthlyDelta(entries, now),
      // Mockup shows mood out of 10.
      avgMood: moodVals.length ? Math.round(mean(moodVals) / 10 * 10) / 10 : 0,
      streak: computeStreak(entries, now),
      activeDays: new Set(entries.map((e) => dayKey(e.createdAt))).size,
    },
    growth,
    growthSeries: buildGrowthSeries(entries, { now }),
    calendar: buildMonthCalendar(entries, { now }),
    emotions: computeEmotionDistribution(entries),
    stress: computeFieldTrend(entries, "stress", { higherIsBetter: false }),
    energy: computeFieldTrend(entries, "energy", { higherIsBetter: true }),
    mood: computeFieldTrend(entries, "score", { higherIsBetter: true }),
    words: computeWordFrequency(entries),
    keyInsights: buildKeyInsights(entries, { now }),
  };
};
