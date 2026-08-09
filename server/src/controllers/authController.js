import * as authService from "../services/authService.js";
import { getGoogleAuthUrl } from "../config/oauth.js";
import env from "../config/env.js";

// Cookie options. httpOnly = JS can't read it (blocks XSS token theft).
// In production over HTTPS we use Secure + SameSite=None; in dev, Lax.
const cookieBase = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? "none" : "lax",
  path: "/",
};
const ACCESS_MAXAGE = 15 * 60 * 1000; // 15 min
const REFRESH_MAXAGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("access_token", accessToken, { ...cookieBase, maxAge: ACCESS_MAXAGE });
  res.cookie("refresh_token", refreshToken, { ...cookieBase, maxAge: REFRESH_MAXAGE });
};
const clearAuthCookies = (res) => {
  res.clearCookie("access_token", cookieBase);
  res.clearCookie("refresh_token", cookieBase);
};

// GET /auth/google -> send the browser to Google's consent screen.
export const googleRedirect = (req, res) => res.redirect(getGoogleAuthUrl());

// GET /auth/google/callback -> Google sends the user back here with ?code.
export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.redirect(`${env.clientUrl}/login?error=missing_code`);

    const { accessToken, refreshToken } = await authService.loginWithGoogle(
      code,
      req.headers["user-agent"]
    );
    setAuthCookies(res, accessToken, refreshToken);
    res.redirect(`${env.clientUrl}/dashboard`);
  } catch (err) {
    console.error("OAuth callback failed:", err.message);
    res.redirect(`${env.clientUrl}/login?error=oauth_failed`);
  }
};

// POST /auth/refresh -> mint a new access token using the refresh cookie.
export const refresh = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = await authService.refreshTokens(
      req.cookies?.refresh_token,
      req.headers["user-agent"]
    );
    setAuthCookies(res, accessToken, refreshToken);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// POST /auth/logout -> revoke the session and clear cookies.
export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.cookies?.refresh_token);
    clearAuthCookies(res);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// GET /auth/me -> who am I? (protected by requireAuth)
export const me = async (req, res, next) => {
  try {
    const user = await authService.getUser(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      growthScore: user.growthScore,
    });
  } catch (err) {
    next(err);
  }
};
