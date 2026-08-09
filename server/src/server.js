import app from "./app.js";
import env from "./config/env.js";
import logger from "./config/logger.js";
import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";

// Start listening IMMEDIATELY so the port is always open. If we waited for
// MongoDB, a DB outage would leave nothing on port 5000 and the frontend proxy
// would report a confusing "502 / ECONNREFUSED" instead of a real error.
app.listen(env.port, () => {
  logger.info(`Server running on http://127.0.0.1:${env.port} [${env.nodeEnv}]`);
});

// Both of these connect in the background and retry on their own.
connectDB();
connectRedis();
