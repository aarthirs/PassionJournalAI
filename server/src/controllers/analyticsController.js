import * as analyticsService from "../services/analytics/analyticsService.js";
import { RANGES } from "../services/analytics/analyticsEngine.js";

export const getAnalytics = async (req, res, next) => {
  try {
    const range = Object.keys(RANGES).includes(req.query.range) ? req.query.range : "1y";
    res.json(await analyticsService.getAnalytics(req.userId, range));
  } catch (err) {
    next(err);
  }
};

export const getCalendar = async (req, res, next) => {
  try {
    const now = new Date();
    const year = Number(req.query.year) || now.getFullYear();
    const rawMonth = req.query.month === undefined ? now.getMonth() : Number(req.query.month);
    const month = Number.isInteger(rawMonth) && rawMonth >= 0 && rawMonth <= 11 ? rawMonth : now.getMonth();
    res.json(await analyticsService.getCalendar(req.userId, { year, month }));
  } catch (err) {
    next(err);
  }
};

export const exportCsv = async (req, res, next) => {
  try {
    const range = Object.keys(RANGES).includes(req.query.range) ? req.query.range : "all";
    const csv = await analyticsService.exportCsv(req.userId, range);
    const stamp = new Date().toISOString().slice(0, 10);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="reflect-ai-journal-${stamp}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
};
