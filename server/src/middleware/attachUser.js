import { getDemoUserId } from "../repository/userRepo.js";

// PLACEHOLDER auth. Sets req.userId so all downstream code is already
// user-scoped. Phase 5 replaces this with JWT/session verification that reads
// the authenticated Google user — the controllers below won't need to change.
export const attachUser = async (req, res, next) => {
  try {
    req.userId = await getDemoUserId();
    next();
  } catch (err) {
    next(err);
  }
};
