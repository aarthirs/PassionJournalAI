import AIContextMemory from "../models/AIContextMemory.js";

// upsert so the first turn creates the document transparently.
export const getOrCreate = (userId) =>
  AIContextMemory.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

export const save = (memory) => memory.save();

export const reset = (userId) => AIContextMemory.deleteOne({ userId });
