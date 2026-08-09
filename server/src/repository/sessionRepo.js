import Session from "../models/Session.js";

export const createSession = ({ userId, refreshTokenHash, userAgent, expiresAt }) =>
  Session.create({ userId, refreshTokenHash, userAgent, expiresAt });

// A session is valid only if it exists AND hasn't expired.
export const findValidSession = (refreshTokenHash) =>
  Session.findOne({ refreshTokenHash, expiresAt: { $gt: new Date() } });

export const revokeSession = (refreshTokenHash) =>
  Session.deleteOne({ refreshTokenHash });

export const revokeAllForUser = (userId) => Session.deleteMany({ userId });
