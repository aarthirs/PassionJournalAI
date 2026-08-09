import * as userRepo from "../repository/userRepo.js";
import * as sessionRepo from "../repository/sessionRepo.js";
import { getGoogleUser } from "../config/oauth.js";
import {
  signAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/tokens.js";

const REFRESH_DAYS = 7;

const unauthorized = (msg) => Object.assign(new Error(msg), { status: 401 });

// Create a fresh access token + refresh token and record the session.
const issueTokens = async (user, userAgent) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

  await sessionRepo.createSession({
    userId: user._id,
    refreshTokenHash: hashToken(refreshToken),
    userAgent,
    expiresAt,
  });

  return { user, accessToken, refreshToken };
};

// Called from the Google callback: turn an auth code into a logged-in session.
export const loginWithGoogle = async (code, userAgent) => {
  const profile = await getGoogleUser(code);
  const user = await userRepo.findOrCreateByGoogle(profile);
  return issueTokens(user, userAgent);
};

// Rotate tokens: validate the old refresh token, revoke it, issue a new pair.
// Rotation means a stolen refresh token is only usable until the next refresh.
export const refreshTokens = async (refreshToken, userAgent) => {
  if (!refreshToken) throw unauthorized("Missing refresh token");

  const hash = hashToken(refreshToken);
  const session = await sessionRepo.findValidSession(hash);
  if (!session) throw unauthorized("Invalid or expired session");

  await sessionRepo.revokeSession(hash); // one-time use
  const user = await userRepo.findById(session.userId);
  if (!user) throw unauthorized("User no longer exists");

  return issueTokens(user, userAgent);
};

export const logout = async (refreshToken) => {
  if (refreshToken) await sessionRepo.revokeSession(hashToken(refreshToken));
};

export const getUser = (userId) => userRepo.findById(userId);
