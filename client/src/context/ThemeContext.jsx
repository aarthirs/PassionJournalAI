import { createContext, useState, useEffect, useCallback } from "react";

export const ThemeContext = createContext();

const STORAGE_KEY = "reflect-theme"; // "light" | "dark" | "system"

const systemPrefersDark = () =>
  window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;

export const ThemeProvider = ({ children }) => {
  const [preference, setPreference] = useState(
    () => localStorage.getItem(STORAGE_KEY) || "system"
  );

  // The value actually applied to the DOM ("system" resolves to one of these).
  const resolve = useCallback(
    (pref) => (pref === "system" ? (systemPrefersDark() ? "dark" : "light") : pref),
    []
  );
  const [resolved, setResolved] = useState(() => resolve(preference));

  // Apply the theme by setting data-theme on <html>; tokens.css does the rest.
  useEffect(() => {
    const next = resolve(preference);
    setResolved(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEY, preference);
  }, [preference, resolve]);

  // When following the system, react live to OS theme changes.
  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next = systemPrefersDark() ? "dark" : "light";
      setResolved(next);
      document.documentElement.setAttribute("data-theme", next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference]);

  const toggle = () => setPreference(resolved === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ preference, setPreference, resolved, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};
