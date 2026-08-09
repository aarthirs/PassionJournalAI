import rateLimit from "express-rate-limit";
import env from "../config/env.js";

/*
 * Rate limiting, tiered by what each endpoint actually costs us.
 *
 * Limits are effectively disabled in development so they never get in the way
 * while building; they only bind in production.
 */
const makeLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max: env.isProd ? max : 100000,
    standardHeaders: true,   // RateLimit-* headers so clients can back off
    legacyHeaders: false,
    message: { error: message },
    // Key by authenticated user when we know them, otherwise by IP — so one
    // office behind a shared NAT doesn't throttle everyone.
    keyGenerator: (req) => req.userId?.toString() || req.ip,
  });

// Login/refresh: protects against credential-stuffing and token grinding.
export const authLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many authentication attempts. Please try again in a few minutes.",
});

// AI calls cost real money per request — the tightest limit.
export const aiLimiter = makeLimiter({
  windowMs: 60 * 1000,
  max: 12,
  message: "You're sending messages very quickly. Please wait a moment.",
});

// Summaries/exports run heavy aggregations.
export const heavyLimiter = makeLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many report requests. Please wait a moment.",
});

// Baseline protection for everything else.
export const generalLimiter = makeLimiter({
  windowMs: 60 * 1000,
  max: 240,
  message: "Too many requests. Please slow down.",
});
