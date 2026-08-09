/*
 * Behavioural pattern detection.
 *
 * All pure functions over an entry array — no DB, no AI — so every conclusion
 * here is deterministic and unit-testable. That matters because these outputs
 * are shown to a person about their own mental state: a confident-sounding
 * wrong answer is worse than saying "not enough data yet".
 *
 * DESIGN RULE: every function refuses to draw a conclusion below a minimum
 * sample size. We never manufacture a "trend" from two entries.
 */

const DAY = 86400000;
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

const MIN_TREND_ENTRIES = 3;   // per window, to call a direction
const MIN_BURNOUT_ENTRIES = 4; // over 14 days, to assess at all

// Entries within [now - days, now]
const withinDays = (history, days, now) => {
  const cutoff = now.getTime() - days * DAY;
  return history.filter((e) => new Date(e.createdAt).getTime() >= cutoff);
};

// Entries in the window BEFORE the recent one (for comparison).
const previousWindow = (history, days, now) => {
  const end = now.getTime() - days * DAY;
  const start = end - days * DAY;
  return history.filter((e) => {
    const t = new Date(e.createdAt).getTime();
    return t >= start && t < end;
  });
};

const average = (entries, pick) => {
  const vals = entries.map(pick).filter((v) => typeof v === "number" && !Number.isNaN(v));
  return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
};

/**
 * Generic trend: recent window vs the window before it.
 * `higherIsBetter` decides whether a rise counts as improving or worsening.
 */
export const getTrend = (history, field, { days = 7, now = new Date(), higherIsBetter = true } = {}) => {
  const recent = withinDays(history, days, now);
  const prior = previousWindow(history, days, now);

  const current = average(recent, (e) => e.analysis?.[field]);
  const previous = average(prior, (e) => e.analysis?.[field]);

  // Not enough to say anything honest.
  if (current === null || recent.length < MIN_TREND_ENTRIES) {
    return { field, current: current === null ? null : Math.round(current), previous: null,
             delta: null, direction: "insufficient", sample: recent.length };
  }
  if (previous === null || prior.length < MIN_TREND_ENTRIES) {
    return { field, current: Math.round(current), previous: null, delta: null,
             direction: "baseline", sample: recent.length };
  }

  const delta = Math.round(current - previous);
  // 5-point dead zone so normal fluctuation isn't reported as a trend.
  let direction = "stable";
  if (delta >= 5) direction = higherIsBetter ? "improving" : "worsening";
  else if (delta <= -5) direction = higherIsBetter ? "worsening" : "improving";

  return { field, current: Math.round(current), previous: Math.round(previous), delta, direction, sample: recent.length };
};

export const getMoodTrend = (h, now = new Date()) => getTrend(h, "score", { now, higherIsBetter: true });
export const getStressTrend = (h, now = new Date()) => getTrend(h, "stress", { now, higherIsBetter: false });
export const getEnergyTrend = (h, now = new Date()) => getTrend(h, "energy", { now, higherIsBetter: true });

/**
 * Burnout signals over 14 days.
 *
 * This is a SUPPORTIVE HEURISTIC, not a diagnosis — it names observable signals
 * ("stress has been high") rather than labelling the person. Requires a real
 * sample before saying anything.
 */
export const assessBurnout = (history, now = new Date()) => {
  const recent = withinDays(history, 14, now);
  if (recent.length < MIN_BURNOUT_ENTRIES) {
    return { level: "insufficient", signals: [], sample: recent.length };
  }

  const stress = average(recent, (e) => e.analysis?.stress);
  const energy = average(recent, (e) => e.analysis?.energy);
  const mood = getMoodTrend(history, now);

  const signals = [];
  if (stress !== null && stress >= 60) signals.push("stress has been consistently high");
  if (energy !== null && energy <= 40) signals.push("energy has been running low");
  if (mood.direction === "worsening") signals.push("mood has been trending downward");

  const level = signals.length === 0 ? "none"
    : signals.length === 1 ? "low"
    : signals.length === 2 ? "moderate"
    : "elevated";

  return {
    level,
    signals,
    sample: recent.length,
    avgStress: stress === null ? null : Math.round(stress),
    avgEnergy: energy === null ? null : Math.round(energy),
  };
};

// Frequency of a string field (emotion / passion) over a window.
const frequency = (history, field, { days = 30, now = new Date(), limit = 5 } = {}) => {
  const recent = withinDays(history, days, now);
  const counts = new Map();

  for (const e of recent) {
    const raw = e.analysis?.[field];
    if (!raw || typeof raw !== "string") continue;
    const label = raw.trim();
    if (!label) continue;
    const key = label.toLowerCase();
    const existing = counts.get(key);
    const at = new Date(e.createdAt);
    if (existing) {
      existing.count += 1;
      if (at > existing.lastSeenAt) existing.lastSeenAt = at;
    } else {
      counts.set(key, { label, count: 1, lastSeenAt: at });
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count || b.lastSeenAt - a.lastSeenAt)
    .slice(0, limit);
};

export const getRecurringEmotions = (h, opts = {}) => frequency(h, "emotion", opts);
export const getRecurringThemes = (h, opts = {}) => frequency(h, "passion", opts);

// Genuine wins worth celebrating. Only reported when actually supported.
export const detectImprovements = (history, now = new Date()) => {
  const out = [];
  const mood = getMoodTrend(history, now);
  const stress = getStressTrend(history, now);
  const energy = getEnergyTrend(history, now);

  if (mood.direction === "improving") out.push(`mood is up ${mood.delta} points from last week`);
  if (stress.direction === "improving") out.push(`stress has eased by ${Math.abs(stress.delta)} points`);
  if (energy.direction === "improving") out.push(`energy is up ${energy.delta} points`);

  const week = withinDays(history, 7, now);
  const days = new Set(week.map((e) => startOfDay(e.createdAt).getTime())).size;
  if (days >= 5) out.push(`journaled ${days} of the last 7 days`);

  return out;
};

// Everything the AI and the UI need, in one call.
export const buildPatternReport = (history = [], now = new Date()) => ({
  mood: getMoodTrend(history, now),
  stress: getStressTrend(history, now),
  energy: getEnergyTrend(history, now),
  burnout: assessBurnout(history, now),
  emotions: getRecurringEmotions(history, { now }),
  themes: getRecurringThemes(history, { now }),
  improvements: detectImprovements(history, now),
  totalEntries: history.length,
});
