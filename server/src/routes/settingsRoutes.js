import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getSettings, patchSettings, listDevices, revokeDevice, exportData, deleteAccount,
} from "../controllers/settingsController.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", getSettings);
router.patch("/", patchSettings);

router.get("/devices", listDevices);
router.delete("/devices/:id", revokeDevice);

router.get("/export", exportData);
router.delete("/account", deleteAccount);

export default router;
