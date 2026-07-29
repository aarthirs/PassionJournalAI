import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, default: "Explorer", trim: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      // sparse: unique only among docs that HAVE an email (anonymous users may not).
      index: { unique: true, sparse: true },
    },
    avatar: { type: String, default: "" },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    growthScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model("User", userSchema);
