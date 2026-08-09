import UserSettings from "../models/UserSettings.js";

// upsert so the first read creates defaults transparently.
export const getOrCreate = (userId) =>
  UserSettings.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

/**
 * `$set` with dot-notation paths so a partial update ("just the AI tone") never
 * wipes sibling fields — which is what would happen if we assigned whole
 * nested objects.
 */
export const update = (userId, flatPaths) =>
  UserSettings.findOneAndUpdate(
    { userId },
    { $set: flatPaths },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );

export const remove = (userId) => UserSettings.deleteOne({ userId });
