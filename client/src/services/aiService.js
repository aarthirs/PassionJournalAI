import api from "./api";

export const analyzeJournal = async (journalText) => {
  const response = await api.post("/ai/analyze", {
    journalText,
  });

  return response.data;
};