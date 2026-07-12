
import app from "./app.js";
import env from "./config/env.js";

console.log("PORT:", process.env.PORT);
console.log("KEY:", process.env.GEMINI_API_KEY);

app.listen(env.port, () => {
  console.log(`🚀 Server running on ${env.port}`);
});