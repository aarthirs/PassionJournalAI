import * as journalService from "../journalService.js";
import { buildPatternReport } from "../analytics/patternDetection.js";
import { findRelatedEntries } from "./retrieval.js";
import { getMemory } from "./memoryService.js";

/*
 * Assembles everything the model sees for one turn:
 *   1. short-term  — the recent transcript (passed in by the caller)
 *   2. long-term   — the AIContextMemory narrative + goals + baseline
 *   3. patterns    — computed trends / burnout / recurring signals
 *   4. retrieved   — the most relevant past entries for THIS message
 *
 * Reads go through journalService, so they hit the Redis cache from Phase 4
 * rather than re-querying Mongo on every message.
 */

const TRANSCRIPT_WINDOW = 12;

export const assembleChatContext = async (userId, { transcript = [], userName = "", currentThreadId = null }) => {
  const latestUser = [...transcript].reverse().find((m) => m.role === "user")?.content || "";

  // Run independent lookups concurrently — they don't depend on each other.
  const [memory, history] = await Promise.all([
    getMemory(userId),
    journalService.getEntries(userId),
  ]);

  const patterns = buildPatternReport(history);
  const related = findRelatedEntries(latestUser, history, { limit: 3, excludeId: currentThreadId });

  return {
    transcript: transcript.slice(-TRANSCRIPT_WINDOW),
    memory,
    patterns,
    related,
    userName,
    history, // reused by the caller for memory refresh, avoiding a second fetch
  };
};
