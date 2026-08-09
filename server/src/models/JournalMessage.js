import mongoose from "mongoose";

const { Schema, model } = mongoose;

// One turn in a conversation. A JournalEntry is the THREAD; these are its turns.
const journalMessageSchema = new Schema(
  {
    journalId: { type: Schema.Types.ObjectId, ref: "JournalEntry", required: true, index: true },
    // Denormalized userId so we can authorize a message without loading the
    // parent thread, and so orphaned rows can still be scoped/cleaned.
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, enum: ["user", "ai"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

// Reading a conversation is always "all messages of this thread, oldest first".
journalMessageSchema.index({ journalId: 1, createdAt: 1 });

journalMessageSchema.methods.toClient = function () {
  return {
    id: this._id.toString(),
    role: this.role,
    content: this.content,
    createdAt: this.createdAt,
  };
};

export default model("JournalMessage", journalMessageSchema);
