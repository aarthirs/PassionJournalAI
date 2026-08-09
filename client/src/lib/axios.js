import axios from "axios";

const apiClient = axios.create({
  // Relative base -> goes through the Vite proxy in dev, same-origin in prod.
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  timeout: 15000,
  withCredentials: true, // send/receive httpOnly auth cookies
  headers: { "Content-Type": "application/json" },
});

// Auto-refresh: when a request 401s because the short-lived access token
// expired, transparently call /auth/refresh once and retry the original.
let refreshing = null;

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || "";
    const isAuthCall =
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout");

    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        // Collapse concurrent refreshes into a single request.
        refreshing = refreshing || apiClient.post("/auth/refresh");
        await refreshing;
        refreshing = null;
        return apiClient(original); // replay the original request
      } catch (e) {
        refreshing = null;
        return Promise.reject(e); // refresh failed -> stay logged out
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
