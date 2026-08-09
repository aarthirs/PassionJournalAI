// Groups entries into the ChatGPT-style buckets shown in the sidebar.
//
// All comparisons are done on LOCAL calendar days (not raw 24-hour deltas), so
// an entry from 11pm last night correctly reads "Yesterday" rather than "Today"
// just because it was under 24 hours ago.

export const GROUP_ORDER = ["Today", "Yesterday", "Previous 7 Days", "Older"];

const startOfLocalDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const getGroupLabel = (date, now = new Date()) => {
  const day = startOfLocalDay(date);
  const today = startOfLocalDay(now);
  const diffDays = Math.round((today - day) / 86400000);

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return "Previous 7 Days";
  return "Older";
};

// Returns [{ label, items }] in a stable display order, skipping empty groups.
export const groupByDate = (entries = [], now = new Date()) => {
  const buckets = new Map(GROUP_ORDER.map((l) => [l, []]));
  for (const e of entries) {
    buckets.get(getGroupLabel(e.createdAt, now)).push(e);
  }
  return GROUP_ORDER
    .map((label) => ({ label, items: buckets.get(label) }))
    .filter((g) => g.items.length > 0);
};
