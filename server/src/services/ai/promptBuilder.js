import { SYSTEM_FRAMING } from "../../utils/safety.js";

/*
 * Assembles the layered prompt. Order is deliberate — the model weights early
 * instructions heavily, so identity/safety framing comes first, then what we
 * know about the person, then the live conversation last (most recent = most
 * salient).
 *
 * Every section is OPTIONAL and omitted when empty, so a brand-new user gets a
 * clean prompt with no "no data available" noise confusing the model.
 */

const MAX_ENTRY_CHARS = 320;
const clip = (s, n = MAX_ENTRY_CHARS) =>
  String(s).length > n ? `${String(s).slice(0, n).trim()}…` : String(s);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const relativeDay = (d) => {
  const days = Math.round((Date.now() - new Date(d).getTime()) / 86400000);
  if (days <= 0) return "earlier today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "last week";
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  return fmtDate(d);
};

const section = (title, body) => (body && body.trim() ? `## ${title}\n${body.trim()}` : "");

// Turns the pattern report into plain language the model can quote naturally.
export const describePatterns = (patterns) => {
  if (!patterns) return "";
  const lines = [];

  const trend = (t, label) => {
    if (!t || t.direction === "insufficient") return;
    if (t.direction === "baseline") { lines.push(`- ${label}: around ${t.current}/100 recently`); return; }
    const word = { improving: "improving", worsening: "declining", stable: "steady" }[t.direction];
    lines.push(`- ${label}: ${word} (${t.current}/100 this week vs ${t.previous} last week)`);
  };

  trend(patterns.mood, "Mood");
  trend(patterns.stress, "Stress");
  trend(patterns.energy, "Energy");

  if (patterns.emotions?.length) {
    lines.push(`- Recurring emotions: ${patterns.emotions.map((e) => `${e.label} (${e.count}x)`).join(", ")}`);
  }
  if (patterns.themes?.length) {
    lines.push(`- Recurring topics: ${patterns.themes.map((t) => `${t.label} (${t.count}x)`).join(", ")}`);
  }
  if (patterns.improvements?.length) {
    lines.push(`- Genuine wins to acknowledge: ${patterns.improvements.join("; ")}`);
  }
  if (patterns.burnout && !["insufficient", "none"].includes(patterns.burnout.level)) {
    lines.push(`- Burnout signals (${patterns.burnout.level}): ${patterns.burnout.signals.join("; ")}`);
  }

  return lines.join("\n");
};

const describeMemory = (memory) => {
  if (!memory) return "";
  const parts = [];
  if (memory.summary) parts.push(memory.summary);

  const activeGoals = (memory.goals || []).filter((g) => g.status === "active").map((g) => g.text);
  if (activeGoals.length) parts.push(`Goals they've mentioned wanting: ${activeGoals.join("; ")}.`);

  if (memory.baseline?.samples >= 3) {
    const b = memory.baseline;
    parts.push(`Their usual baseline is mood ~${b.mood}, stress ~${b.stress}, energy ~${b.energy} (out of 100).`);
  }
  return parts.join("\n\n");
};

const describeRelated = (entries) => {
  if (!entries?.length) return "";
  return entries
    .map((e) => `- ${relativeDay(e.createdAt)} ("${e.title}"): ${clip(e.journal)}`)
    .join("\n");
};

/*
 * Turns the user's saved AI preferences into concrete prompt instructions.
 * This is what makes the Settings page real rather than decorative — each
 * toggle changes the text the model actually receives.
 */
const TONES = {
  warm: "Be warm and encouraging, like a close friend who believes in them.",
  direct: "Be straightforward and practical. Skip flourish; get to what matters.",
  gentle: "Be especially gentle and soft. Move slowly and never push.",
};

const LENGTHS = {
  short: "Keep your reply to 1-2 short paragraphs. Be concise.",
  medium: "Keep your reply to 2-3 short paragraphs.",
  long: "You may write 3-4 paragraphs, exploring the thought more fully.",
};

export const describePreferences = (prefs) => {
  if (!prefs) return "";
  const lines = [];

  if (TONES[prefs.tone]) lines.push(`- ${TONES[prefs.tone]}`);
  if (LENGTHS[prefs.replyLength]) lines.push(`- ${LENGTHS[prefs.replyLength]}`);

  lines.push(
    prefs.followUpQuestions === false
      ? "- Do NOT end with a question. Simply reflect and let them sit with it."
      : "- End with ONE thoughtful follow-up question."
  );

  if (prefs.referencePastEntries === false) {
    lines.push("- Do NOT reference their previous entries. Respond only to what they wrote now.");
  }

  return lines.join("\n");
};

const ANALYSIS_SCHEMA = `{
  "reply": "your warm conversational response",
  "passion": "one category (Programming, Reading, Fitness, Career, Learning, Personal Growth, Other)",
  "mood": "one word",
  "emotion": "one word",
  "depth": "Light | Medium | Deep",
  "depthScore": 0, "stress": 0, "energy": 0, "score": 0,
  "reflection": "2-3 sentence third-person insight",
  "goal": "one gentle actionable suggestion",
  "quote": "one short encouraging line"
}`;

/**
 * @param transcript [{role, content}] recent turns, chronological
 * @param memory     AIContextMemory doc (or null)
 * @param patterns   buildPatternReport output (or null)
 * @param related    relevant past entries (or [])
 */
export const buildChatPrompt = ({ transcript = [], memory = null, patterns = null, related = [], userName = "", preferences = null } = {}) => {
  const convo = transcript
    .map((m) => `${m.role === "user" ? "Person" : "You"}: ${m.content}`)
    .join("\n\n");

  // Preferences can switch whole context layers off.
  const usePast = preferences?.referencePastEntries !== false;

  const blocks = [
    SYSTEM_FRAMING,
    section("How this person prefers you to respond", describePreferences(preferences)),
    userName ? `The person's name is ${userName.split(" ")[0]}.` : "",
    section("What you remember about this person", usePast ? describeMemory(memory) : ""),
    section("Observed patterns (from their tracked data)", describePatterns(patterns)),
    section("Related things they wrote before", usePast ? describeRelated(related) : ""),
    section(
      "Using this context",
      [
        "- Reference their history NATURALLY, the way a friend would remember ('you mentioned last week…'). Never list data back at them.",
        "- If there are genuine wins, acknowledge them specifically.",
        "- If burnout signals are present, gently name what you notice and suggest rest or support — do not diagnose.",
        "- Only reference the past when it actually helps. Do not force it.",
      ].join("\n")
    ),
    section(
      "Task",
      `Continue the conversation, then analyze the person's most recent message.\nReturn ONLY valid JSON (no markdown fences):\n${ANALYSIS_SCHEMA}\nNumeric fields are 0-100.`
    ),
    `## Conversation\n${convo}`,
  ];

  return blocks.filter(Boolean).join("\n\n");
};

// Prompt for rewriting the long-term memory narrative.
export const buildMemorySummaryPrompt = ({ previousSummary = "", recentEntries = [], patterns = null }) => {
  const entries = recentEntries
    .map((e) => `- ${fmtDate(e.createdAt)}: ${clip(e.journal, 240)}`)
    .join("\n");

  return `You maintain a private, factual memory profile that helps a journaling
companion remember someone over months. Write in third person, warm but concise.

Capture: what matters to them, recurring struggles and strengths, goals they've
voiced, and how they've changed over time. Do NOT diagnose or use clinical terms.
Keep it under 180 words. Prefer durable facts over one-off moods.

${previousSummary ? `Existing profile (update and condense it, keep what still matters):\n${previousSummary}\n` : ""}
${patterns ? `Observed patterns:\n${describePatterns(patterns)}\n` : ""}
Recent entries:
${entries}

Return ONLY the updated profile text, no preamble.`;
};

// Prompt for a weekly / monthly / yearly reflection.
export const buildPeriodSummaryPrompt = ({ period, stats, patterns, entries = [] }) => {
  const sample = entries
    .slice(0, 12)
    .map((e) => `- ${fmtDate(e.createdAt)}: ${clip(e.journal, 200)}`)
    .join("\n");

  return `${SYSTEM_FRAMING}

Write a ${period} reflection FOR the person (address them as "you"). Warm,
specific, encouraging, honest. 2-3 short paragraphs. Acknowledge real effort,
name any pattern worth noticing gently, and end with one kind forward-looking
suggestion. No clinical language, no diagnosis.

Stats: ${stats.entries} entries across ${stats.activeDays} days; average mood ${stats.avgMood}/100, stress ${stats.avgStress}/100, energy ${stats.avgEnergy}/100.
${patterns ? `Patterns:\n${describePatterns(patterns)}\n` : ""}
Entries:
${sample}

Return ONLY valid JSON (no markdown):
{ "content": "the reflection", "highlights": ["3-4 short bullet takeaways"] }`;
};
