import { verifyAccessToken } from "../utils/tokens.js";

// Gate for protected routes. Reads the access-token cookie, verifies its
// signature, and attaches req.userId. No DB call -> cheap on every request.
export const requireAuth = (req, res, next) => {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub; // the user's id, from the signed token
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
};
