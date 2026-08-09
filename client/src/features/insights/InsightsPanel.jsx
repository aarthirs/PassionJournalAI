import { X } from "lucide-react";
import TodaysReflection from "./TodaysReflection";
import TodaysProgress from "./TodaysProgress";
import WeeklyTrendCard from "./WeeklyTrendCard";
import PatternsCard from "./PatternsCard";
import SummaryCard from "./SummaryCard";
import useInsights from "../../hooks/useInsights";
import usePatterns from "../../hooks/usePatterns";

const InsightsPanel = ({ analysis, onClose }) => {
  const { streak, consistency, series, weekStats, latest, isLoading } = useInsights();
  const { data: patterns, isLoading: patternsLoading } = usePatterns();

  const shown = analysis || latest?.analysis || null;

  return (
    <div className="flex h-full max-h-full flex-col border-[var(--border)] bg-[var(--surface-panel)] xl:border-l">
      <header className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-3.5">
        <h2 className="text-base font-semibold">Today's Insights</h2>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-[var(--text-faint)] sm:inline">
            {new Date().toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)] xl:hidden"
              aria-label="Close insights"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-[var(--surface-subtle)]" />
          ))
        ) : (
          <>
            <TodaysReflection analysis={shown} />
            <TodaysProgress analysis={shown} streak={streak} consistency={consistency} />
            <PatternsCard patterns={patterns} isLoading={patternsLoading} />
            <WeeklyTrendCard series={series} stats={weekStats} />
            <SummaryCard />
          </>
        )}
      </div>
    </div>
  );
};

export default InsightsPanel;
