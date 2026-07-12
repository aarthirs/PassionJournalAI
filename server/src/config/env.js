import dotenv from "dotenv";

dotenv.config();

const env = {
  port: process.env.PORT || 5000,
  geminiApiKey: process.env.GEMINI_API_KEY,
  nodeEnv: process.env.NODE_ENV || "development",
};

export default env;