import Summary from "../models/Summary.js";

export const findForPeriod = (userId, period, periodStart) =>
  Summary.findOne({ userId, period, periodStart });

// Overwrite-in-place so regenerating a summary never creates duplicates.
export const upsert = ({ userId, period, periodStart, periodEnd, content, highlights, stats, source }) =>
  Summary.findOneAndUpdate(
    { userId, period, periodStart },
    { userId, period, periodStart, periodEnd, content, highlights, stats, source },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

export const listRecent = (userId, period, limit = 6) =>
  Summary.find({ userId, period }).sort({ periodStart: -1 }).limit(limit);
