import app from "./app.js";
import env from "./config/env.js";
import logger from "./config/logger.js";
import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";

const start = async () => {
  // MongoDB is required — fail fast if it can't connect.
  try {
    await connectDB();
  } catch (err) {
    logger.error("Failed to connect to MongoDB. Exiting.", err.message);
    process.exit(1);
  }

  // Redis is optional — a failure here must NOT stop the server. If it's
  // unavailable the cache helpers degrade to direct DB access.
  connectRedis();

  app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port} [${env.nodeEnv}]`);
  });
};

start();
