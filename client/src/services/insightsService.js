import api from "./api";

export const fetchPatterns = async () => {
  const { data } = await api.get("/insights/patterns");
  return data;
};

export const fetchSummary = async (period = "weekly") => {
  const { data } = await api.get("/insights/summary", { params: { period } });
  return data;
};

export const regenerateSummary = async (period = "weekly") => {
  const { data } = await api.post("/insights/summary", null, { params: { period } });
  return data;
};
