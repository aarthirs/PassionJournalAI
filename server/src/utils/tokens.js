import jwt from "jsonwebtoken";
import crypto from "crypto";
import env from "../config/env.js";

// Access token: short-lived, STATELESS. It's a signed JWT — the server can
// verify it without a DB lookup, which is what makes auth fast.
const ACCESS_TTL = "15m";

export const signAccessToken = (userId) =>
  jwt.sign({ sub: String(userId) }, env.jwtSecret, { expiresIn: ACCESS_TTL });

// Throws if the token is missing/tampered/expired — callers catch and 401.
export const verifyAccessToken = (token) => jwt.verify(token, env.jwtSecret);

// Refresh token: long-lived, STATEFUL. It's an opaque random string; the DB
// stores only its SHA-256 hash, so a database leak can't be used to forge one.
export const generateRefreshToken = () => crypto.randomBytes(40).toString("hex");

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
