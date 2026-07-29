// Server-side validation. NEVER trust the client — the same rules the UI
// enforces are re-checked here (zod-based schemas arrive in Phase 5).
export const validateJournalText = (text) => {
  if (typeof text !== "string" || !text.trim()) {
    return "Journal text is required.";
  }
  if (text.trim().length < 15) {
    return "Please write at least 15 characters.";
  }
  if (text.length > 5000) {
    return "Journal text is too long (max 5000 characters).";
  }
  return null;
};
