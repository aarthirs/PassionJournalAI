import { useQuery } from "@tanstack/react-query";
import { fetchAllJournals } from "../services/journalService";
import { getCurrentStreak } from "../utils/dashboardUtils";
import { buildWeeklySeries, getConsistency, getWeekStats } from "../utils/insights";

/**
 * Single source of truth for the insights panel.
 *
 * Shares the ["journals"] key family with the sidebar, so one
 * invalidateQueries(["journals"]) after a send refreshes BOTH — which is
 * exactly the dual-state problem this replaces.
 */
export const useInsights = () => {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["journals", "all"],
    queryFn: fetchAllJournals,
  });

  const series = buildWeeklySeries(history);

  return {
    history,
    isLoading,
    streak: getCurrentStreak(history),
    consistency: getConsistency(history),
    series,
    weekStats: getWeekStats(series),
    totalEntries: history.length,
    // Most recent entry drives "today's" panel values.
    latest: history[0] ?? null,
  };
};

export default useInsights;
