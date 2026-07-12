import express from "express";

import {
analyzeJournal
}
from "../controllers/aiController.js";

const router = express.Router();

router.post(
"/analyze",
analyzeJournal
);

export default router;