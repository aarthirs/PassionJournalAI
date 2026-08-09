import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  googleRedirect,
  googleCallback,
  refresh,
  logout,
  me,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/google", googleRedirect);
router.get("/google/callback", googleCallback);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, me); // only this one needs a valid session

export default router;
