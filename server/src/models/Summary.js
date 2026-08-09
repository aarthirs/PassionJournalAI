import mongoose from "mongoose";

const { Schema, model } = mongoose;

// A generated weekly / monthly / yearly reflection.
const summarySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    period: { type: String, enum: ["weekly", "monthly", "yearly"], required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },

    content: { type: String, default: "" },
    highlights: { type: [String], default: [] },
    stats: {
      entries: { type: Number, default: 0 },
      avgMood: { type: Number, default: 0 },
      avgStress: { type: Number, default: 0 },
      avgEnergy: { type: Number, default: 0 },
      activeDays: { type: Number, default: 0 },
      topTheme: { type: String, default: "" },
      topEmotion: { type: String, default: "" },
    },
    source: { type: String, enum: ["ai", "rule"], default: "ai" },
  },
  { timestamps: true }
);

// One summary per user per period-start: regenerating overwrites rather than duplicating.
summarySchema.index({ userId: 1, period: 1, periodStart: 1 }, { unique: true });

summarySchema.methods.toClient = function () {
  return {
    id: this._id.toString(),
    period: this.period,
    periodStart: this.periodStart,
    periodEnd: this.periodEnd,
    content: this.content,
    highlights: this.highlights,
    stats: this.stats,
    createdAt: this.createdAt,
  };
};

export default model("Summary", summarySchema);
