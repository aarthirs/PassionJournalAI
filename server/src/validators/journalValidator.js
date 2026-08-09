export const validateJournalText = (text) => {
  if (typeof text !== "string" || !text.trim()) return "Journal text is required.";
  if (text.trim().length < 15) return "Please write at least 15 characters.";
  if (text.length > 5000) return "Journal text is too long (max 5000 characters).";
  return null;
};

// Validates + normalizes a PATCH body. Returns {error} or {fields}.
export const validateEntryUpdate = (body = {}) => {
  const fields = {};

  if (body.title !== undefined) {
    if (typeof body.title !== "string") return { error: "title must be a string." };
    const t = body.title.trim();
    if (!t) return { error: "Title cannot be empty." };
    if (t.length > 120) return { error: "Title is too long (max 120 characters)." };
    fields.title = t;
  }

  for (const flag of ["pinned", "favorite", "archived"]) {
    if (body[flag] !== undefined) {
      if (typeof body[flag] !== "boolean") return { error: `${flag} must be a boolean.` };
      fields[flag] = body[flag];
    }
  }

  if (Object.keys(fields).length === 0) return { error: "No valid fields to update." };
  return { fields };
};
