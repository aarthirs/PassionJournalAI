import dotenv from "dotenv";

dotenv.config();

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
  serveStatic: process.env.SERVE_STATIC === "true",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  geminiApiKey: process.env.GEMINI_API_KEY,
  mongoUri: process.env.MONGODB_URI,
  redisUrl: process.env.REDIS_URL,

  jwtSecret: process.env.JWT_SECRET,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      "http://localhost:5000/api/v1/auth/google/callback",
  },
};

export default env;
