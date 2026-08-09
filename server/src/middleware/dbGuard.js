import { isDbConnected } from "../config/db.js";

// Guards routes that need the database. Returns an explicit, readable 503
// instead of letting a Mongoose call hang or throw a vague 500.
export const dbGuard = (req, res, next) => {
  if (isDbConnected()) return next();

  res.status(503).json({
    error: "Database unavailable",
    hint:
      "The API is running but cannot reach MongoDB. If you are using Atlas, " +
      "whitelist your IP (Network Access -> Add IP Address). The server will " +
      "reconnect automatically.",
  });
};
