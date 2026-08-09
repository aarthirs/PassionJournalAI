import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getPatterns, getSummary } from "../controllers/insightsController.js";

const router = express.Router();
router.use(requireAuth);

router.get("/patterns", getPatterns);
router.get("/summary", getSummary);
router.post("/summary", getSummary); // force regeneration

export default router;
