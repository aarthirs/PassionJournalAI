import api from "./api";

export const fetchAnalytics = async (range = "1y") => {
  const { data } = await api.get("/analytics", { params: { range } });
  return data;
};

export const fetchCalendar = async (year, month) => {
  const { data } = await api.get("/analytics/calendar", { params: { year, month } });
  return data;
};

// Triggers a browser download of the CSV. We fetch as a blob (rather than just
// linking) so the request carries our auth cookies through axios.
export const downloadCsv = async (range = "all") => {
  const res = await api.get("/analytics/export", { params: { range }, responseType: "blob" });
  const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `reflect-ai-journal-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
