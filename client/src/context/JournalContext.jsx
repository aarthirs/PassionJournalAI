import { createContext, useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  fetchAllJournals,
  createJournal,
  deleteJournal as apiDeleteJournal,
  importJournals,
} from "../services/journalService";

export const JournalContext = createContext();

const LEGACY_KEY = "journal-history";
const MIGRATED_FLAG = "reflect-migrated-to-db";

const initialAnalysis = { passion: "", mood: "", score: 0, reflection: "", goal: "" };

export const JournalProvider = ({ children }) => {
  const qc = useQueryClient();

  const [journalText, setJournalText] = useState("");
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Which past entry is being viewed (null = composing a new one).
  const [activeEntry, setActiveEntry] = useState(null);

  const loadHistory = useCallback(async () => {
    const entries = await fetchAllJournals();
    setHistory(entries);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        await migrateLegacyIfNeeded();
        await loadHistory();
      } catch (err) {
        console.error("Failed to load journals:", err);
        setToast({ message: "Could not load your journals.", type: "error" });
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const migrateLegacyIfNeeded = async () => {
    if (localStorage.getItem(MIGRATED_FLAG)) return;
    const raw = localStorage.getItem(LEGACY_KEY);
    if (raw) {
      try {
        const legacy = JSON.parse(raw);
        if (Array.isArray(legacy) && legacy.length > 0) {
          await importJournals(legacy);
          setToast({ message: `Migrated ${legacy.length} entries to your account.`, type: "success" });
        }
      } catch (e) {
        console.error("Migration failed:", e);
      }
    }
    localStorage.setItem(MIGRATED_FLAG, "1");
    localStorage.removeItem(LEGACY_KEY);
  };

  // Keeps the sidebar (React Query) and the dashboard widgets (this context)
  // in sync after a write.
  const syncAfterWrite = async () => {
    qc.invalidateQueries({ queryKey: ["journals"] });
    await loadHistory();
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
      const entry = await createJournal(journalText);
      setAnalysis(entry.analysis);
      setActiveEntry(entry);
      setJournalText("");
      await syncAfterWrite();
      setToast({ message: "Journal analyzed successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setError("Unable to analyze your journal.");
      setToast({ message: "Unable to analyze journal.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Sidebar selection: load a past entry into the reflection panel.
  const selectEntry = (entry) => {
    setActiveEntry(entry);
    setAnalysis(entry.analysis || initialAnalysis);
    setJournalText("");
    setError("");
  };

  const startNew = () => {
    setActiveEntry(null);
    setAnalysis(initialAnalysis);
    setJournalText("");
    setError("");
  };

  const removeEntry = async (id) => {
    try {
      await apiDeleteJournal(id);
      if (activeEntry?.id === id) startNew();
      await syncAfterWrite();
    } catch (err) {
      console.error(err);
      setToast({ message: "Could not delete entry.", type: "error" });
    }
  };

  return (
    <JournalContext.Provider
      value={{
        journalText, setJournalText,
        analysis, setAnalysis,
        history, setHistory,
        activeEntry, selectEntry, startNew,
        analyzeEntry, removeEntry,
        loading, setLoading,
        error, setError,
        toast, setToast,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};
