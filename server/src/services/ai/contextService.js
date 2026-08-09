import * as journalService from "../journalService.js";
import * as settingsRepo from "../../repository/settingsRepo.js";
import { buildPatternReport } from "../analytics/patternDetection.js";
import { findRelatedEntries } from "./retrieval.js";
import { getMemory } from "./memoryService.js";

/*
 * Assembles everything the model sees for one turn:
 *   1. short-term  — recent transcript
 *   2. long-term   — AIContextMemory narrative, goals, baseline
 *   3. patterns    — computed trends / burnout / recurring signals
 *   4. retrieved   — most relevant past entries for THIS message
 *
 * User settings can switch layers off. When memory is disabled we skip those
 * lookups entirely rather than fetching and discarding them — a privacy setting
 * should mean the data is not read, not merely unused.
 */

const TRANSCRIPT_WINDOW = 12;

export const assembleChatContext = async (userId, { transcript = [], userName = "", currentThreadId = null }) => {
  const latestUser = [...transcript].reverse().find((m) => m.role === "user")?.content || "";

  const settingsDoc = await settingsRepo.getOrCreate(userId);
  const settings = settingsDoc.toClient();
  const prefs = settings.ai;

  // Independent lookups run concurrently.
  const [memory, history] = await Promise.all([
    prefs.memoryEnabled ? getMemory(userId) : Promise.resolve(null),
    journalService.getEntries(userId),
  ]);

  const patterns = settings.analysis.detectPatterns ? buildPatternReport(history) : null;

  const related = prefs.referencePastEntries
    ? findRelatedEntries(latestUser, history, { limit: 3, excludeId: currentThreadId })
    : [];

  return {
    transcript: transcript.slice(-TRANSCRIPT_WINDOW),
    memory,
    patterns,
    related,
    userName,
    preferences: prefs,
    settings,
    history, // reused for memory refresh, avoiding a second fetch
  };
};
