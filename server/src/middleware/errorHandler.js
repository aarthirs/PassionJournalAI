import logger from "../config/logger.js";

// Centralized error handler. Controllers call  (err) instead of
// each writing their own try/catch response. Keeps handlers thin.
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  logger.error(`${status} ${req.method} ${req.originalUrl} - ${err.message}`);

  res.status(status).json({
    error:
      status === 500 ? "Internal Server Error" : err.message,
  });
};
