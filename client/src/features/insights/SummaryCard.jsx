import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, RefreshCw } from "lucide-react";

import InsightCard from "./InsightCard";
import Markdown from "../../utils/markdown.jsx";
import { fetchSummary, regenerateSummary } from "../../services/insightsService";

const PERIODS = [
  { key: "weekly", label: "Week" },
  { key: "monthly", label: "Month" },
  { key: "yearly", label: "Year" },
];

const SummaryCard = () => {
  const [period, setPeriod] = useState("weekly");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["journals", "summary", period],
    queryFn: () => fetchSummary(period),
    staleTime: 5 * 60 * 1000,
  });

  const regen = useMutation({
    mutationFn: () => regenerateSummary(period),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journals", "summary", period] }),
  });

  const summary = data?.summary;

  return (
    <InsightCard
      icon={<CalendarDays size={13} />}
      title="Reflection"
      action={
        <div className="flex items-center gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-md px-2 py-1 text-[0.7rem] font-medium transition ${
                period === p.key
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--text-faint)] hover:bg-[var(--surface-subtle)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      }
    >
      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-3 animate-pulse rounded bg-[var(--surface-subtle)]" style={{ width: `${90 - i * 15}%` }} />
          ))}
        </div>
      ) : !summary ? (
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          {data?.message || "Not enough entries in this period yet."}
        </p>
      ) : (
        <>
          <Markdown content={summary.content} className="text-sm text-[var(--text)]" />

          {summary.highlights?.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-[var(--border)] pt-3">
              {summary.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  <span className="text-[var(--accent)]">•</span>
                  {h}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--border)] pt-2.5">
            <span className="text-xs text-[var(--text-faint)]">
              {summary.stats.entries} entries · {summary.stats.activeDays} active days
            </span>
            <button
              onClick={() => regen.mutate()}
              disabled={regen.isPending}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-[var(--accent)] transition hover:bg-[var(--accent-soft)] disabled:opacity-50"
            >
              <RefreshCw size={12} className={regen.isPending ? "animate-spin" : ""} />
              {regen.isPending ? "Writing…" : "Refresh"}
            </button>
          </div>
        </>
      )}
    </InsightCard>
  );
};

export default SummaryCard;
