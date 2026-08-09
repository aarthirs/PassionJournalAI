// Derives a short, human-readable title from journal content.
// Used when an entry is created and as a fallback for older entries that were
// saved before titles existed (so no data migration is required).
export const deriveTitle = (content = "", max = 48) => {
  const clean = String(content).replace(/\s+/g, " ").trim();
  if (!clean) return "Untitled reflection";
  if (clean.length <= max) return clean;
  // Cut at the last word boundary before the limit so we don't split a word.
  const slice = clean.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 20 ? slice.slice(0, lastSpace) : slice).trim() + "…";
};
