import mongoose from "mongoose";
import { deriveTitle } from "../utils/title.js";

const { Schema, model } = mongoose;

// Extended in Phase 7 to power the insights panel. Every new field has a
// default, so entries created before Phase 7 remain valid with no migration.
const analysisSchema = new Schema(
  {
    passion: { type: String, default: "" },
    mood: { type: String, default: "" },
    score: { type: Number, default: 0, min: 0, max: 100 },
    reflection: { type: String, default: "" },
    goal: { type: String, default: "" },

    emotion: { type: String, default: "" },                 // e.g. "Contemplative"
    depth: { type: String, enum: ["", "Light", "Medium", "Deep"], default: "" },
    depthScore: { type: Number, default: 0, min: 0, max: 100 },
    stress: { type: Number, default: 0, min: 0, max: 100 },
    energy: { type: Number, default: 0, min: 0, max: 100 },
    quote: { type: String, default: "" },                   // short encouraging line
  },
  { _id: false }
);

const journalEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: true, trim: true },
    title: { type: String, default: "", trim: true, maxlength: 120 },
    analysis: { type: analysisSchema, default: () => ({}) },
    source: { type: String, enum: ["ai", "rule"], default: "ai" },

    pinned: { type: Boolean, default: false },
    favorite: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },

    // Bumped on every new turn so threads can be ordered by recent activity.
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

journalEntrySchema.index({ userId: 1, createdAt: -1, _id: -1 });
journalEntrySchema.index({ userId: 1, pinned: -1, updatedAt: -1 });

journalEntrySchema.pre("save", function (next) {
  if (!this.title) this.title = deriveTitle(this.content);
  next();
});

/*
 * Serializer written against a PLAIN object, not a document.
 *
 * That lets read-only queries use .lean() — which skips hydrating full Mongoose
 * documents (getters, change tracking, methods) and is measurably cheaper when
 * loading a few hundred entries for analytics. The document method below simply
 * delegates, so both call sites share one definition of the client shape.
 */
export const serializeEntry = (doc) => {
  if (!doc) return null;
  const a = doc.analysis || {};
  return {
    id: String(doc._id),
    title: doc.title || deriveTitle(doc.content),
    journal: doc.content,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    lastMessageAt: doc.lastMessageAt,
    pinned: !!doc.pinned,
    favorite: !!doc.favorite,
    archived: !!doc.archived,
    analysis: {
      passion: a.passion ?? "",
      mood: a.mood ?? "",
      score: a.score ?? 0,
      reflection: a.reflection ?? "",
      goal: a.goal ?? "",
      emotion: a.emotion ?? "",
      depth: a.depth ?? "",
      depthScore: a.depthScore ?? 0,
      stress: a.stress ?? 0,
      energy: a.energy ?? 0,
      quote: a.quote ?? "",
    },
  };
};

journalEntrySchema.methods.toClient = function () {
  const a = this.analysis || {};
  return {
    id: this._id.toString(),
    title: this.title || deriveTitle(this.content),
    journal: this.content,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    lastMessageAt: this.lastMessageAt,
    pinned: !!this.pinned,
    favorite: !!this.favorite,
    archived: !!this.archived,
    analysis: {
      passion: a.passion ?? "",
      mood: a.mood ?? "",
      score: a.score ?? 0,
      reflection: a.reflection ?? "",
      goal: a.goal ?? "",
      emotion: a.emotion ?? "",
      depth: a.depth ?? "",
      depthScore: a.depthScore ?? 0,
      stress: a.stress ?? 0,
      energy: a.energy ?? 0,
      quote: a.quote ?? "",
    },
  };
};

export default model("JournalEntry", journalEntrySchema);
