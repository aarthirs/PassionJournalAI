import mongoose from "mongoose";

const { Schema, model } = mongoose;

const labelledCount = new Schema(
  { label: String, count: { type: Number, default: 1 }, lastSeenAt: Date },
  { _id: false }
);

// ONE document per user — the AI's long-term picture of this person's journey.
// Kept as a single doc (not an event log) because it's read on every single turn:
// one indexed lookup instead of an aggregation over months of history.
const aiContextMemorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },

    // AI-written rolling narrative ("what I know about this person").
    summary: { type: String, default: "" },

    themes: { type: [labelledCount], default: [] },
    emotions: { type: [labelledCount], default: [] },
    goals: {
      type: [new Schema(
        {
          text: String,
          status: { type: String, enum: ["active", "achieved", "paused"], default: "active" },
          noticedAt: { type: Date, default: Date.now },
        },
        { _id: false }
      )],
      default: [],
    },

    // Rolling averages — the person's "normal", so the AI can notice deviation.
    baseline: {
      mood: { type: Number, default: 0 },
      stress: { type: Number, default: 0 },
      energy: { type: Number, default: 0 },
      samples: { type: Number, default: 0 },
    },

    // Drives WHEN we spend an AI call to rewrite the summary (see memoryService).
    turnsSinceSummary: { type: Number, default: 0 },
    lastSummarizedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default model("AIContextMemory", aiContextMemorySchema);
