import api from "./api";

export const fetchSettings = async () => {
  const { data } = await api.get("/settings");
  return data;
};

export const patchSettings = async (partial) => {
  const { data } = await api.patch("/settings", partial);
  return data;
};

export const fetchDevices = async () => {
  const { data } = await api.get("/settings/devices");
  return data;
};

export const revokeDevice = async (id) => {
  const { data } = await api.delete(`/settings/devices/${id}`);
  return data;
};

// Full JSON export — fetched as a blob so auth cookies are sent.
export const downloadExport = async () => {
  const res = await api.get("/settings/export", { responseType: "blob" });
  const url = URL.createObjectURL(new Blob([res.data], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `reflect-ai-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const deleteAccount = async () => {
  const { data } = await api.delete("/settings/account", { data: { confirm: "DELETE" } });
  return data;
};
