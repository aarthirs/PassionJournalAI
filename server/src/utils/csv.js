/*
 * CSV serialization.
 *
 * Journal text routinely contains commas, quotes and newlines — exactly the
 * characters that corrupt naive CSV output. RFC 4180 rules applied here:
 *   - wrap a field in quotes if it contains a comma, quote, CR or LF
 *   - escape an embedded quote by doubling it
 * A leading BOM makes Excel open UTF-8 correctly instead of mangling accents.
 */

export const escapeCsvField = (value) => {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const toCsv = (rows, headers) => {
  const head = headers.map(escapeCsvField).join(",");
  const body = rows.map((row) => row.map(escapeCsvField).join(",")).join("\r\n");
  return `﻿${head}\r\n${body}`;
};

export const journalsToCsv = (entries = []) =>
  toCsv(
    entries.map((e) => [
      new Date(e.createdAt).toISOString(),
      e.title,
      e.analysis?.mood ?? "",
      e.analysis?.emotion ?? "",
      e.analysis?.depth ?? "",
      e.analysis?.score ?? "",
      e.analysis?.stress ?? "",
      e.analysis?.energy ?? "",
      e.analysis?.passion ?? "",
      e.analysis?.reflection ?? "",
      e.analysis?.goal ?? "",
      e.journal ?? "",
    ]),
    ["Date","Title","Mood","Emotion","Depth","MoodScore","Stress","Energy","Topic","Reflection","Goal","Entry"]
  );
