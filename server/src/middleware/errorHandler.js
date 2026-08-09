import logger from "../config/logger.js";
import env from "../config/env.js";

// Centralized error handler. Controllers call next(err) rather than each
// writing their own response.
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;

  logger.error(`${status} ${req.method} ${req.originalUrl} - ${err.message}`);
  // A 500 means we have a bug; without the stack it is guesswork to find it.
  if (status >= 500 && err.stack) logger.error(err.stack);

  res.status(status).json({
    error: status === 500 ? "Internal Server Error" : err.message,
    // Surface the real reason in development only — never leak internals in prod.
    ...(status >= 500 && !env.isProd ? { detail: err.message } : {}),
  });
};
