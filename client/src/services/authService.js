import api from "./api";

export const fetchMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const logoutRequest = async () => {
  await api.post("/auth/logout");
};
