import { createContext, useState, useEffect, useCallback } from "react";
import { fetchMe, logoutRequest } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, ask the server "who am I?". If the cookie is valid we get the
  // user; if not (401), we simply stay logged out.
  const checkAuth = useCallback(async () => {
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login is a full-page redirect to the server, which sends the user to Google.
  const login = () => {
    window.location.href = "/api/v1/auth/google";
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch {
      /* ignore network errors on logout */
    }
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
