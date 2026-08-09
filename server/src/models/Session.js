import mongoose from "mongoose";

const { Schema, model } = mongoose;

// One row per active refresh token (i.e. per logged-in device/browser).
const sessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // We store only the HASH of the refresh token, never the token itself.
    refreshTokenHash: { type: String, required: true, index: true },
    userAgent: { type: String, default: "" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index: MongoDB automatically deletes a session once expiresAt passes.
// This keeps the collection self-cleaning with zero cron jobs.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model("Session", sessionSchema);
