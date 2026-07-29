import { createContext, useState, useEffect } from "react";

import {
  getJournals,
  createJournal,
  deleteJournal as apiDeleteJournal,
  importJournals,
} from "../services/journalService";

export const JournalContext = createContext();

const LEGACY_KEY = "journal-history";
const MIGRATED_FLAG = "reflect-migrated-to-db";

const initialAnalysis = {
  passion: "",
  mood: "",
  score: 0,
  reflection: "",
  goal: "",
};

export const JournalProvider = ({ children }) => {
  const [journalText, setJournalText] = useState("");
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load history from the API on mount, migrating any old localStorage data once.
  useEffect(() => {
    const init = async () => {
      try {
        await migrateLegacyIfNeeded();
        const entries = await getJournals();
        setHistory(entries);
      } catch (err) {
        console.error("Failed to load journals:", err);
        setToast({ message: "Could not load your journals.", type: "error" });
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One-time move of pre-existing browser data into the database.
  const migrateLegacyIfNeeded = async () => {
    if (localStorage.getItem(MIGRATED_FLAG)) return;

    const raw = localStorage.getItem(LEGACY_KEY);
    if (raw) {
      try {
        const legacy = JSON.parse(raw);
        if (Array.isArray(legacy) && legacy.length > 0) {
          await importJournals(legacy);
          setToast({
            message: `Migrated ${legacy.length} entries to your account.`,
            type: "success",
          });
        }
      } catch (e) {
        console.error("Migration failed:", e);
      }
    }

    localStorage.setItem(MIGRATED_FLAG, "1");
    localStorage.removeItem(LEGACY_KEY);
  };

  const analyzeEntry = async () => {
    if (!journalText.trim()) {
      setError("Please write something.");
      setAnalysis(initialAnalysis);
      return;
    }
    if (journalText.trim().length < 15) {
      setError("Please write at least 15 characters.");
      setAnalysis(initialAnalysis);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Server analyzes AND persists in one call, returning the saved entry.
      const entry = await createJournal(journalText);

      setAnalysis(entry.analysis);
      setHistory((prev) => [entry, ...prev]);
      setJournalText("");
      setToast({ message: "Journal analyzed successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setError("Unable to analyze your journal.");
      setToast({ message: "Unable to analyze journal.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Optimistic delete: update UI immediately, roll back if the API fails.
  const removeEntry = async (id) => {
    const snapshot = history;
    setHistory((h) => h.filter((e) => e.id !== id));
    try {
      await apiDeleteJournal(id);
    } catch (err) {
      console.error(err);
      setHistory(snapshot);
      setToast({ message: "Could not delete entry.", type: "error" });
    }
  };

  return (
    <JournalContext.Provider
      value={{
        journalText,
        setJournalText,
        analysis,
        setAnalysis,
        history,
        setHistory,
        analyzeEntry,
        removeEntry,
        loading,
        setLoading,
        error,
        setError,
        toast,
        setToast,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};
