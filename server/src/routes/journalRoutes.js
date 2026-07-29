import express from "express";
import { attachUser } from "../middleware/attachUser.js";
import {
  createJournal,
  listJournals,
  deleteJournal,
  importJournals,
} from "../controllers/journalController.js";

const router = express.Router();

// Every journal route is user-scoped.
router.use(attachUser);

router.get("/", listJournals);
router.post("/", createJournal);
router.post("/import", importJournals);
router.delete("/:id", deleteJournal);

export default router;
