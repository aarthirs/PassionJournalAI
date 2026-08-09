import { GoogleGenAI } from "@google/genai";
import env from "../config/env.js";
import logger from "../config/logger.js";
import { analyzeByRules, replyByRules } from "./ruleEngine.js";
import { SYSTEM_FRAMING } from "../utils/safety.js";
import {
  buildChatPrompt,
  buildMemorySummaryPrompt,
  buildPeriodSummaryPrompt,
} from "./ai/promptBuilder.js";

const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });
const MODEL = "gemini-2.5-flash";

const parseJson = (raw) =>
  JSON.parse(String(raw).replace(/```json/gi, "").replace(/```/g, "").trim());

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Number(n) || 0));

const normalizeAnalysis = (a = {}) => {
  let score = Number(a.score) || 0;
  if (score > 0 && score <= 10) score *= 10;
  const depths = ["Light", "Medium", "Deep"];
  return {
    passion: String(a.passion || "Personal Growth").trim(),
    mood: String(a.mood || "Neutral").trim(),
    emotion: String(a.emotion || "Reflective").trim(),
    depth: depths.includes(a.depth) ? a.depth : "Medium",
    depthScore: clamp(a.depthScore ?? 50),
    stress: clamp(a.stress ?? 40),
    energy: clamp(a.energy ?? 50),
    score: clamp(score),
    reflection: String(a.reflection || "").trim(),
    goal: String(a.goal || "").trim(),
    quote: String(a.quote || "").trim(),
  };
};

const generate = async (prompt) => {
  const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
  return response.text;
};

/**
 * Memory-aware conversational reply.
 * `context` = { transcript, memory, patterns, related, userName }
 */
export const generateChatReply = async (context) => {
  const transcript = context?.transcript || [];
  const latestUser = [...transcript].reverse().find((m) => m.role === "user")?.content || "";

  try {
    const parsed = parseJson(await generate(buildChatPrompt(context)));
    const reply = String(parsed.reply || "").trim();
    if (!reply) throw new Error("Model returned no reply");
    return { reply, analysis: normalizeAnalysis(parsed), source: "ai" };
  } catch (error) {
    logger.warn(`Gemini chat failed (${error.message}). Falling back to rule engine.`);
    const { reply, analysis } = replyByRules(latestUser);
    return { reply, analysis, source: "rule" };
  }
};

// Rewrites the long-term memory narrative. Returns plain text.
export const generateMemorySummary = async ({ previousSummary, recentEntries, patterns }) => {
  const text = await generate(buildMemorySummaryPrompt({ previousSummary, recentEntries, patterns }));
  return String(text || "").replace(/```/g, "").trim();
};

// Weekly / monthly / yearly reflection. Returns { content, highlights }.
export const generatePeriodSummary = async ({ period, stats, patterns, entries }) => {
  try {
    const parsed = parseJson(await generate(buildPeriodSummaryPrompt({ period, stats, patterns, entries })));
    return {
      content: String(parsed.content || "").trim(),
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights.map(String).slice(0, 5) : [],
      source: "ai",
    };
  } catch (error) {
    logger.warn(`Period summary failed (${error.message}). Using deterministic fallback.`);
    return {
      content:
        `You wrote ${stats.entries} ${stats.entries === 1 ? "entry" : "entries"} across ` +
        `${stats.activeDays} ${stats.activeDays === 1 ? "day" : "days"} this ${period.replace("ly", "")}. ` +
        `Your average mood was ${stats.avgMood}/100. Showing up to reflect at all is the habit that compounds.`,
      highlights: [
        `${stats.entries} entries, ${stats.activeDays} active days`,
        stats.topTheme ? `Most frequent focus: ${stats.topTheme}` : "",
        stats.topEmotion ? `Most frequent emotion: ${stats.topEmotion}` : "",
      ].filter(Boolean),
      source: "rule",
    };
  }
};

// Legacy one-shot analyze (still backing /ai/analyze).
export const analyzeWithGemini = async (journalText) => {
  const prompt = `${SYSTEM_FRAMING}

Analyze this journal entry. Return ONLY valid JSON (no markdown) with keys:
passion, mood, emotion, depth (Light|Medium|Deep), depthScore, stress, energy, score, reflection, goal, quote.
Numeric fields are 0-100.

Journal:
${journalText}`;

  try {
    return normalizeAnalysis(parseJson(await generate(prompt)));
  } catch (error) {
    logger.warn(`Gemini analyze failed (${error.message}). Falling back to rule engine.`);
    return analyzeByRules(journalText);
  }
};
