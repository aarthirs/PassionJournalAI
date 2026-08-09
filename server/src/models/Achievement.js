import mongoose from "mongoose";

const { Schema, model } = mongoose;

const achievementSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    key: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    achievedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One unlock per user per achievement. Combined with insert-only writes, this is
// what keeps "Achieved 8 Jul" stable forever instead of drifting to "today".
achievementSchema.index({ userId: 1, key: 1 }, { unique: true });

achievementSchema.methods.toClient = function () {
  return {
    key: this.key,
    title: this.title,
    description: this.description,
    achievedAt: this.achievedAt,
  };
};

export default model("Achievement", achievementSchema);
