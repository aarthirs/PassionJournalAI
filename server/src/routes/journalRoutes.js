import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createJournal,
  listJournals,
  listPinnedJournals,
  listAllJournals,
  updateJournal,
  deleteJournal,
  importJournals,
} from "../controllers/journalController.js";
import { getMessages, postMessage } from "../controllers/chatController.js";

const router = express.Router();

router.use(requireAuth);

// Static paths must be declared before "/:id" so they aren't captured by it.
router.get("/all", listAllJournals);
router.get("/pinned", listPinnedJournals);
router.post("/import", importJournals);

router.get("/", listJournals);
router.post("/", createJournal); // legacy one-shot analyze+save

// Conversation turns. ":id" = "new" starts a fresh thread.
router.get("/:id/messages", getMessages);
router.post("/:id/messages", postMessage);

router.patch("/:id", updateJournal);
router.delete("/:id", deleteJournal);

export default router;
