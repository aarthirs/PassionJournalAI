import * as memoryRepo from "../../repository/memoryRepo.js";
import logger from "../../config/logger.js";

/*
 * Long-term memory maintenance.
 *
 * COST STRATEGY — the key decision in this file.
 * Rewriting the narrative summary needs an AI call. Doing that on every turn
 * would roughly double our token spend and latency for very little benefit,
 * since a person's durable profile barely changes between two messages.
 *
 * So we split memory into two speeds:
 *   FAST  (every turn, free): counters, baseline averages, goal capture — pure
 *         arithmetic on the analysis we already computed.
 *   SLOW  (occasionally, costs a call): the AI-written narrative, refreshed only
 *         after SUMMARY_EVERY_N_TURNS or once MAX_SUMMARY_AGE has passed.
 */

const SUMMARY_EVERY_N_TURNS = 6;
const MAX_SUMMARY_AGE_MS = 3 * 86400000; // 3 days
const MAX_TRACKED = 8;

export const getMemory = (userId) => memoryRepo.getOrCreate(userId);

// Merge a label into a [{label,count,lastSeenAt}] list, keeping the top N.
const bumpLabel = (list, label, now) => {
  if (!label || typeof label !== "string") return list;
  const clean = label.trim();
  if (!clean) return list;

  const key = clean.toLowerCase();
  const existing = list.find((x) => x.label.toLowerCase() === key);
  if (existing) {
    existing.count += 1;
    existing.lastSeenAt = now;
  } else {
    list.push({ label: clean, count: 1, lastSeenAt: now });
  }

  return list.sort((a, b) => b.count - a.count || b.lastSeenAt - a.lastSeenAt).slice(0, MAX_TRACKED);
};

// Running mean — O(1) and no need to re-read history.
const updateBaseline = (baseline, analysis) => {
  const n = (baseline.samples || 0) + 1;
  const blend = (prev, next) =>
    typeof next === "number" && !Number.isNaN(next)
      ? Math.round(((prev || 0) * (n - 1) + next) / n)
      : prev;

  return {
    mood: blend(baseline.mood, analysis.score),
    stress: blend(baseline.stress, analysis.stress),
    energy: blend(baseline.energy, analysis.energy),
    samples: n,
  };
};

// Heuristic goal capture. Deliberately conservative: a false "goal" is worse
// than a missed one, because the AI will keep referring back to it.
const GOAL_PATTERNS = [
  /\bi\s+want\s+to\s+([^.!?\n]{6,90})/i,
  /\bi'?m\s+trying\s+to\s+([^.!?\n]{6,90})/i,
  /\bi\s+need\s+to\s+([^.!?\n]{6,90})/i,
  /\bmy\s+goal\s+is\s+to\s+([^.!?\n]{6,90})/i,
  /\bi\s+hope\s+to\s+([^.!?\n]{6,90})/i,
];

export const extractGoals = (text = "") => {
  const found = [];
  for (const re of GOAL_PATTERNS) {
    const m = String(text).match(re);
    if (m?.[1]) {
      const goal = m[1].trim().replace(/\s+/g, " ");
      if (goal.length >= 6) found.push(goal);
    }
  }
  return found;
};

const mergeGoals = (goals, extracted, now) => {
  for (const text of extracted) {
    const key = text.toLowerCase();
    // Substring check both ways so "run a 5k" and "run a 5k this year" don't duplicate.
    const dup = goals.some((g) => {
      const existing = g.text.toLowerCase();
      return existing.includes(key) || key.includes(existing);
    });
    if (!dup) goals.push({ text, status: "active", noticedAt: now });
  }
  return goals.slice(-12); // keep the most recent dozen
};

/**
 * FAST path — runs after every turn. No AI, no history scan.
 */
export const recordTurn = async (userId, { analysis = {}, userText = "" } = {}) => {
  const memory = await memoryRepo.getOrCreate(userId);
  const now = new Date();

  memory.emotions = bumpLabel(memory.emotions || [], analysis.emotion, now);
  memory.themes = bumpLabel(memory.themes || [], analysis.passion, now);
  memory.baseline = updateBaseline(memory.baseline || {}, analysis);
  memory.goals = mergeGoals(memory.goals || [], extractGoals(userText), now);
  memory.turnsSinceSummary = (memory.turnsSinceSummary || 0) + 1;

  await memoryRepo.save(memory);
  return memory;
};

// Should we spend a call rewriting the narrative?
export const needsSummaryRefresh = (memory, now = new Date()) => {
  if (!memory) return false;
  if (!memory.summary) return (memory.baseline?.samples || 0) >= 2; // wait for a little signal
  if ((memory.turnsSinceSummary || 0) >= SUMMARY_EVERY_N_TURNS) return true;
  if (!memory.lastSummarizedAt) return true;
  return now.getTime() - new Date(memory.lastSummarizedAt).getTime() > MAX_SUMMARY_AGE_MS;
};

/**
 * SLOW path — writes the AI-generated narrative.
 * `generate` is injected so this module never imports the AI provider directly
 * (keeps it unit-testable and avoids a circular dependency).
 */
export const refreshSummary = async (userId, { recentEntries, patterns, generate }) => {
  const memory = await memoryRepo.getOrCreate(userId);
  try {
    const summary = await generate({
      previousSummary: memory.summary,
      recentEntries,
      patterns,
    });
    if (summary && summary.trim()) {
      memory.summary = summary.trim();
      memory.lastSummarizedAt = new Date();
      memory.turnsSinceSummary = 0;
      await memoryRepo.save(memory);
    }
  } catch (err) {
    // Memory is an enhancement — never let it break a conversation.
    logger.warn(`Memory summary refresh failed: ${err.message}`);
  }
  return memory;
};

export const resetMemory = (userId) => memoryRepo.reset(userId);
