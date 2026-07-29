import api from "./api";

// Thin, typed wrappers around the journal API. Components/context call these
// instead of touching axios or localStorage directly.

export const getJournals = async () => {
  const { data } = await api.get("/journals");
  return data;
};

export const createJournal = async (journalText) => {
  const { data } = await api.post("/journals", { journalText });
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
