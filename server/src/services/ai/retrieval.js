/*
 * Retrieval of relevant PAST entries.
 *
 * Uses keyword overlap (a simplified BM25-style score) rather than vector
 * embeddings. Why: embeddings need an embedding model call per entry plus a
 * vector index, which is real cost and infrastructure. At per-user scale
 * (hundreds of entries) lexical overlap already surfaces "you mentioned this
 * before" well. The function signature is the seam: swapping in embeddings later
 * means replacing this file only.
 */

const STOP = new Set(`i me my myself we our you your he she it they them the a an and or but if then
than that this these those is am are was were be been being do does did doing have has had having
of to in on at for with about from as so just really very much more most some any not no can could
would should will shall may might must im ive dont cant its there here what when where who whom how
why all also too own same s t don now day today tonight yesterday tomorrow feel felt feeling like`.split(/\s+/));

export const tokenize = (text = "") =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

/**
 * Scores past entries against the current message.
 * excludeId keeps the active thread out of its own "past entries".
 */
export const findRelatedEntries = (query, history = [], { limit = 3, excludeId = null } = {}) => {
  const queryTerms = new Set(tokenize(query));
  if (queryTerms.size === 0) return [];

  const scored = [];
  for (const entry of history) {
    if (excludeId && entry.id === excludeId) continue;

    const terms = tokenize(`${entry.title || ""} ${entry.journal || ""}`);
    if (!terms.length) continue;

    const unique = new Set(terms);
    let overlap = 0;
    for (const t of unique) if (queryTerms.has(t)) overlap++;
    if (overlap === 0) continue;

    // Normalize by query size so long entries don't automatically win, and add a
    // mild recency nudge so a recent match outranks an equally-relevant old one.
    const relevance = overlap / queryTerms.size;
    const ageDays = (Date.now() - new Date(entry.createdAt).getTime()) / 86400000;
    const recency = 1 / (1 + ageDays / 30);
    scored.push({ entry, score: relevance * 0.85 + recency * 0.15, overlap });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter((s) => s.overlap >= 2) // require real overlap, not one incidental word
    .map((s) => s.entry);
};
