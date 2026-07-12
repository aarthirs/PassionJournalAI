import { GoogleGenAI } from "@google/genai";
import { validateAnalysis } from "../validators/analysisValidator.js";
import { analyzeByRules } from "./ruleEngine.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const analyzeWithGemini = async (journalText) => {
  const prompt = `
You are an AI Passion Journal assistant.

Analyze the user's journal entry and return ONLY valid JSON.

Rules:

1. Return ONLY JSON.
2. No markdown.
3. Score must be an integer between 0 and 100.
4. Reflection should be 2-3 sentences.
5. Goal should be one actionable sentence.
6. Passion should be one category only.
7. Mood should be one word.

Passion Categories:
Programming
Reading
Fitness
Football
Music
Art
Career
Learning
Personal Growth
Other

JSON Schema:

{
  "passion":"",
  "mood":"",
  "score":0,
  "reflection":"",
  "goal":""
}

Journal:

${journalText}
`;

  try {

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleaned = response.text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(cleaned);

    // Normalize score
    result.score = Number(result.score);

    if (result.score <= 10) {
      result.score *= 10;
    }

    result.score = Math.min(
      100,
      Math.max(0, result.score)
    );

    // Clean strings
    result.passion = result.passion.trim();
    result.mood = result.mood.trim();
    result.reflection = result.reflection.trim();
    result.goal = result.goal.trim();

    // Validate response
    if (!validateAnalysis(result)) {
      throw new Error("Invalid AI response");
    }

    return result;

  } catch (error) {

    console.warn(
      "Gemini failed. Falling back to Rule Engine."
    );

    return analyzeByRules(journalText);

  }
};