import { analyzeWithGemini } from "../services/geminiService.js";

export const analyzeJournal = async (req, res, next) => {
  try {
    const { journalText } = req.body;
    const result = await analyzeWithGemini(journalText);
    res.json(result);
  } catch (error) {
    next(error); // handled centrally by errorHandler middleware
  }
};
