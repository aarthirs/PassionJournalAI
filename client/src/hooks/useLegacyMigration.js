import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { importJournals } from "../services/journalService";

const LEGACY_KEY = "journal-history";
const MIGRATED_FLAG = "reflect-migrated-to-db";

/**
 * One-time import of pre-database (localStorage) entries.
 * Extracted from the old JournalContext so the migration survived that
 * context's removal — it runs once per browser, then never again.
 */
export const useLegacyMigration = () => {
  const qc = useQueryClient();
  const [migrated, setMigrated] = useState(0);

  useEffect(() => {
    if (localStorage.getItem(MIGRATED_FLAG)) return;

    const run = async () => {
      const raw = localStorage.getItem(LEGACY_KEY);
      if (raw) {
        try {
          const legacy = JSON.parse(raw);
          if (Array.isArray(legacy) && legacy.length > 0) {
            await importJournals(legacy);
            setMigrated(legacy.length);
            qc.invalidateQueries({ queryKey: ["journals"] });
          }
        } catch (e) {
          console.error("Legacy migration failed:", e);
        }
      }
      localStorage.setItem(MIGRATED_FLAG, "1");
      localStorage.removeItem(LEGACY_KEY);
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return migrated;
};

export default useLegacyMigration;
