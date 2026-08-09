import mongoose from "mongoose";
import * as settingsRepo from "../repository/settingsRepo.js";
import * as sessionRepo from "../repository/sessionRepo.js";
import * as journalService from "./journalService.js";
import * as userRepo from "../repository/userRepo.js";
import Session from "../models/Session.js";
import logger from "../config/logger.js";
import { cacheDel, keys } from "../utils/cache.js";

export const getSettings = async (userId) => (await settingsRepo.getOrCreate(userId)).toClient();

export const updateSettings = async (userId, flatPaths) => {
  const updated = await settingsRepo.update(userId, flatPaths);
  // AI settings feed the prompt, so drop cached derivations that depend on them.
  await cacheDel(keys.patterns(userId));
  return updated.toClient();
};

/**
 * Devices = active sessions. We can only show what we actually store
 * (user-agent + timestamps); we deliberately do not do IP geolocation.
 */
const parseAgent = (ua = "") => {
  const browser =
    /Edg\//.test(ua) ? "Edge" :
    /OPR\//.test(ua) ? "Opera" :
    /Chrome\//.test(ua) ? "Chrome" :
    /Safari\//.test(ua) && !/Chrome/.test(ua) ? "Safari" :
    /Firefox\//.test(ua) ? "Firefox" : "Unknown browser";

  const os =
    /Windows NT 10/.test(ua) ? "Windows" :
    /Windows/.test(ua) ? "Windows" :
    /Mac OS X/.test(ua) ? "macOS" :
    /Android/.test(ua) ? "Android" :
    /iPhone|iPad/.test(ua) ? "iOS" :
    /Linux/.test(ua) ? "Linux" : "Unknown OS";

  return { browser, os };
};

export const listDevices = async (userId, currentRefreshHash = null) => {
  const sessions = await Session.find({ userId, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
  return sessions.map((s) => {
    const { browser, os } = parseAgent(s.userAgent);
    return {
      id: s._id.toString(),
      browser,
      os,
      signedInAt: s.createdAt,
      expiresAt: s.expiresAt,
      current: currentRefreshHash ? s.refreshTokenHash === currentRefreshHash : false,
    };
  });
};

export const revokeDevice = async (userId, sessionId) => {
  const res = await Session.deleteOne({ _id: sessionId, userId });
  return res.deletedCount > 0;
};

export const revokeAllDevices = (userId) => sessionRepo.revokeAllForUser(userId);

/**
 * Complete data export. Everything we hold about the user, in one JSON file —
 * which is both a useful feature and the practical basis for a data-access request.
 */
export const exportAllData = async (userId) => {
  const [user, settings, entries] = await Promise.all([
    userRepo.findById(userId),
    settingsRepo.getOrCreate(userId),
    journalService.getEntries(userId),
  ]);

  const JournalMessage = mongoose.model("JournalMessage");
  const Summary = mongoose.model("Summary");
  const Achievement = mongoose.model("Achievement");
  const AIContextMemory = mongoose.model("AIContextMemory");

  const [messages, summaries, achievements, memory] = await Promise.all([
    JournalMessage.find({ userId }).sort({ createdAt: 1 }).lean(),
    Summary.find({ userId }).sort({ periodStart: -1 }).lean(),
    Achievement.find({ userId }).sort({ achievedAt: 1 }).lean(),
    AIContextMemory.findOne({ userId }).lean(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    format: "reflect-ai-export-v1",
    profile: user
      ? { name: user.name, email: user.email, joinedAt: user.createdAt, provider: user.provider }
      : null,
    settings: settings.toClient(),
    entries,
    messages: messages.map((m) => ({
      journalId: String(m.journalId), role: m.role, content: m.content, createdAt: m.createdAt,
    })),
    summaries: summaries.map((s) => ({
      period: s.period, periodStart: s.periodStart, content: s.content,
      highlights: s.highlights, stats: s.stats,
    })),
    achievements: achievements.map((a) => ({
      key: a.key, title: a.title, achievedAt: a.achievedAt,
    })),
    aiMemory: memory
      ? { summary: memory.summary, themes: memory.themes, emotions: memory.emotions, goals: memory.goals }
      : null,
  };
};

/**
 * Permanent account deletion.
 *
 * Order matters: child data first, the User row last, so a mid-way failure never
 * leaves a deleted user with orphaned journals. Each collection is named
 * explicitly rather than looped over the connection — being deliberate about
 * what gets destroyed is worth the verbosity here.
 */
export const deleteAccount = async (userId) => {
  const models = [
    "JournalMessage",
    "JournalEntry",
    "AIContextMemory",
    "Summary",
    "Achievement",
    "UserSettings",
    "Session",
  ];

  const deleted = {};
  for (const name of models) {
    const res = await mongoose.model(name).deleteMany({ userId });
    deleted[name] = res.deletedCount ?? 0;
  }

  const userRes = await mongoose.model("User").deleteOne({ _id: userId });
  deleted.User = userRes.deletedCount ?? 0;

  await cacheDel(
    keys.journalList(userId), keys.journalFirstPage(userId, 20), keys.pinned(userId),
    keys.patterns(userId), keys.analytics(userId, "6m"),
    keys.analytics(userId, "1y"), keys.analytics(userId, "all")
  );

  logger.info(`Account deleted for ${userId}: ${JSON.stringify(deleted)}`);
  return deleted;
};
