import * as journalRepo from "../repository/journalRepo.js";
import * as messageRepo from "../repository/messageRepo.js";
import { generateChatReply, generateMemorySummary } from "./geminiService.js";
import { assembleChatContext } from "./ai/contextService.js";
import { recordTurn, needsSummaryRefresh, refreshSummary, getMemory } from "./ai/memoryService.js";
import { detectCrisisSignal, SUPPORT_NOTICE } from "../utils/safety.js";
import { cacheDel, keys } from "../utils/cache.js";
import logger from "../config/logger.js";

const notFound = () => Object.assign(new Error("Conversation not found."), { status: 404 });

const invalidate = (userId) =>
  cacheDel(keys.journalList(userId), keys.journalFirstPage(userId, 20), keys.pinned(userId), keys.patterns(userId),
    keys.analytics(userId, "6m"), keys.analytics(userId, "1y"), keys.analytics(userId, "all"));

// Pre-Phase-7 entries have no message rows; synthesize them on first open.
const backfillIfEmpty = async (thread) => {
  if ((await messageRepo.countByJournal(thread._id)) > 0) return;

  const docs = [{
    journalId: thread._id, userId: thread.userId, role: "user",
    content: thread.content, createdAt: thread.createdAt, updatedAt: thread.createdAt,
  }];

  if (thread.analysis?.reflection) {
    const t = new Date(new Date(thread.createdAt).getTime() + 1000);
    docs.push({
      journalId: thread._id, userId: thread.userId, role: "ai",
      content: thread.analysis.reflection, createdAt: t, updatedAt: t,
    });
  }
  await messageRepo.addMany(docs);
};

export const getConversation = async (userId, journalId) => {
  const thread = await journalRepo.findByIdForUser(userId, journalId);
  if (!thread) throw notFound();
  await backfillIfEmpty(thread);
  const messages = await messageRepo.listByJournal(thread._id);
  return { thread: thread.toClient(), messages: messages.map((m) => m.toClient()) };
};

/**
 * Append a user turn, generate a memory-aware reply, persist both, update memory.
 */
export const sendMessage = async (userId, journalId, text, { userName = "" } = {}) => {
  let thread;

  if (journalId) {
    thread = await journalRepo.findByIdForUser(userId, journalId);
    if (!thread) throw notFound();
    await backfillIfEmpty(thread);
  } else {
    thread = await journalRepo.createEntry({ userId, content: text, analysis: {} });
  }

  await messageRepo.addMessage({ journalId: thread._id, userId, role: "user", content: text });

  const transcript = (await messageRepo.listByJournal(thread._id)).map((m) => ({
    role: m.role, content: m.content,
  }));

  // Layered context: memory + patterns + retrieved past entries + transcript.
  const context = await assembleChatContext(userId, {
    transcript,
    userName,
    currentThreadId: thread._id.toString(),
  });

  const { reply, analysis, source } = await generateChatReply(context);

  const aiMessage = await messageRepo.addMessage({
    journalId: thread._id, userId, role: "ai", content: reply,
  });

  thread.analysis = analysis;
  thread.source = source;
  thread.lastMessageAt = new Date();
  await thread.save();

  // FAST memory update — cheap arithmetic, every turn (unless disabled).
  if (context.preferences?.memoryEnabled !== false) {
    await recordTurn(userId, { analysis, userText: text });
  }

  await invalidate(userId);

  // SLOW memory update — only when due. Deliberately NOT awaited so the user
  // isn't kept waiting on a second model call; failures are logged, not fatal.
  // Only maintain memory if the user has it enabled.
  const memoryEnabled = context.preferences?.memoryEnabled !== false;
  const memory = memoryEnabled ? await getMemory(userId) : null;
  if (memoryEnabled && needsSummaryRefresh(memory)) {
    refreshSummary(userId, {
      recentEntries: context.history.slice(0, 12),
      patterns: context.patterns,
      generate: generateMemorySummary,
    }).catch((e) => logger.warn(`Background memory refresh failed: ${e.message}`));
  }

  return {
    thread: thread.toClient(),
    aiMessage: aiMessage.toClient(),
    supportNotice: detectCrisisSignal(text) ? SUPPORT_NOTICE : null,
  };
};

export const deleteConversation = (journalId) => messageRepo.deleteByJournal(journalId);
