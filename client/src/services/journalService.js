import api from "./api";

// Paginated history. Returns { items, nextCursor }.
export const fetchHistoryPage = async ({ cursor, limit = 20, q = "", filter } = {}) => {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  if (q) params.q = q;
  if (filter) params.filter = filter;
  const { data } = await api.get("/journals", { params });
  return data;
};

export const fetchPinned = async () => {
  const { data } = await api.get("/journals/pinned");
  return data;
};

// Full recent set — used by the dashboard widgets (streak, weekly trend).
export const fetchAllJournals = async () => {
  const { data } = await api.get("/journals/all");
  return data;
};

export const createJournal = async (journalText) => {
  const { data } = await api.post("/journals", { journalText });
  return data;
};

export const updateJournal = async (id, fields) => {
  const { data } = await api.patch(`/journals/${id}`, fields);
  return data;
};

export const deleteJournal = async (id) => {
  const { data } = await api.delete(`/journals/${id}`);
  return data;
};

export const importJournals = async (entries) => {
  const { data } = await api.post("/journals/import", { entries });
  return data;
};
