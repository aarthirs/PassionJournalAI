import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getAnalytics, getCalendar, exportCsv } from "../controllers/analyticsController.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", getAnalytics);
router.get("/calendar", getCalendar);
router.get("/export", exportCsv);

export default router;
