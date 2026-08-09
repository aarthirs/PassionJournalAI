import mongoose from "mongoose";

const { Schema, model } = mongoose;

/*
 * One settings document per user.
 *
 * Defaults live HERE (not in the UI) so the server is the single source of truth
 * and a brand-new user behaves identically to one who has never opened Settings.
 */
const userSettingsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },

    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
    language: { type: String, enum: ["en", "hi", "es", "fr", "de"], default: "en" },

    // These genuinely change how the model is prompted (see promptBuilder).
    ai: {
      tone: { type: String, enum: ["warm", "direct", "gentle"], default: "warm" },
      replyLength: { type: String, enum: ["short", "medium", "long"], default: "medium" },
      followUpQuestions: { type: Boolean, default: true },
      memoryEnabled: { type: Boolean, default: true },
      referencePastEntries: { type: Boolean, default: true },
    },

    notifications: {
      dailyReminder: { type: Boolean, default: false },
      reminderTime: { type: String, default: "20:00" }, // HH:mm, 24h
      weeklySummary: { type: Boolean, default: true },
      achievementAlerts: { type: Boolean, default: true },
    },

    analysis: {
      trackStress: { type: Boolean, default: true },
      trackEnergy: { type: Boolean, default: true },
      detectPatterns: { type: Boolean, default: true },
    },

    privacy: {
      // Off by default: sharing anything is an explicit opt-in, never assumed.
      allowAnonymousInsights: { type: Boolean, default: false },
      storeConversationHistory: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

userSettingsSchema.methods.toClient = function () {
  return {
    theme: this.theme,
    language: this.language,
    ai: {
      tone: this.ai?.tone ?? "warm",
      replyLength: this.ai?.replyLength ?? "medium",
      followUpQuestions: this.ai?.followUpQuestions ?? true,
      memoryEnabled: this.ai?.memoryEnabled ?? true,
      referencePastEntries: this.ai?.referencePastEntries ?? true,
    },
    notifications: {
      dailyReminder: this.notifications?.dailyReminder ?? false,
      reminderTime: this.notifications?.reminderTime ?? "20:00",
      weeklySummary: this.notifications?.weeklySummary ?? true,
      achievementAlerts: this.notifications?.achievementAlerts ?? true,
    },
    analysis: {
      trackStress: this.analysis?.trackStress ?? true,
      trackEnergy: this.analysis?.trackEnergy ?? true,
      detectPatterns: this.analysis?.detectPatterns ?? true,
    },
    privacy: {
      allowAnonymousInsights: this.privacy?.allowAnonymousInsights ?? false,
      storeConversationHistory: this.privacy?.storeConversationHistory ?? true,
    },
    updatedAt: this.updatedAt,
  };
};

export default model("UserSettings", userSettingsSchema);
