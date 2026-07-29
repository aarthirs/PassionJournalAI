import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Embedded analysis. Kept denormalized inside the entry for now; when the
// analytics phase needs cross-entry emotion queries we can promote this to a
// standalone MoodAnalysis collection (roadmap Phase 9).
const analysisSchema = new Schema(
  {
    passion: { type: String, default: "" },
    mood: { type: String, default: "" },
    score: { type: Number, default: 0, min: 0, max: 100 },
    reflection: { type: String, default: "" },
    goal: { type: String, default: "" },
  },
  { _id: false }
);

const journalEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: true, trim: true },
    analysis: { type: analysisSchema, default: () => ({}) },
    source: { type: String, enum: ["ai", "rule"], default: "ai" },
  },
  { timestamps: true }
);

// Compound index powering the two hot reads: history list and weekly trend
// ("most recent entries for this user").
journalEntrySchema.index({ userId: 1, createdAt: -1 });

// Serialize to the EXACT shape the existing React components already consume,
// so swapping localStorage -> MongoDB requires no component changes.
journalEntrySchema.methods.toClient = function () {
  return {
    id: this._id.toString(),
    journal: this.content,
    createdAt: this.createdAt,
    analysis: {
      passion: this.analysis?.passion ?? "",
      mood: this.analysis?.mood ?? "",
      score: this.analysis?.score ?? 0,
      reflection: this.analysis?.reflection ?? "",
      goal: this.analysis?.goal ?? "",
    },
  };
};

export default model("JournalEntry", journalEntrySchema);
