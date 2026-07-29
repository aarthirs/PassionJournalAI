import dotenv from "dotenv";

dotenv.config();

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  geminiApiKey: process.env.GEMINI_API_KEY,
  mongoUri: process.env.MONGODB_URI,
  redisUrl: process.env.REDIS_URL, // optional — caching is off when unset
};

export default env;
