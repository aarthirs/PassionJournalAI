import * as settingsService from "../services/settingsService.js";
import { validateSettingsUpdate } from "../validators/settingsValidator.js";
import { hashToken } from "../utils/tokens.js";

export const getSettings = async (req, res, next) => {
  try { res.json(await settingsService.getSettings(req.userId)); }
  catch (err) { next(err); }
};

export const patchSettings = async (req, res, next) => {
  try {
    const { error, set } = validateSettingsUpdate(req.body);
    if (error) return res.status(400).json({ error });
    res.json(await settingsService.updateSettings(req.userId, set));
  } catch (err) { next(err); }
};

export const listDevices = async (req, res, next) => {
  try {
    // Hash the caller's own refresh cookie so we can flag "this device".
    const rt = req.cookies?.refresh_token;
    res.json(await settingsService.listDevices(req.userId, rt ? hashToken(rt) : null));
  } catch (err) { next(err); }
};

export const revokeDevice = async (req, res, next) => {
  try {
    const ok = await settingsService.revokeDevice(req.userId, req.params.id);
    if (!ok) return res.status(404).json({ error: "Device session not found." });
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const exportData = async (req, res, next) => {
  try {
    const data = await settingsService.exportAllData(req.userId);
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="reflect-ai-export-${stamp}.json"`);
    res.send(JSON.stringify(data, null, 2));
  } catch (err) { next(err); }
};

const cookieBase = { httpOnly: true, path: "/" };

export const deleteAccount = async (req, res, next) => {
  try {
    // Typed confirmation: destructive and irreversible, so require intent.
    if (req.body?.confirm !== "DELETE") {
      return res.status(400).json({ error: 'Send { "confirm": "DELETE" } to confirm account deletion.' });
    }
    const deleted = await settingsService.deleteAccount(req.userId);
    res.clearCookie("access_token", cookieBase);
    res.clearCookie("refresh_token", cookieBase);
    res.json({ success: true, deleted });
  } catch (err) { next(err); }
};
