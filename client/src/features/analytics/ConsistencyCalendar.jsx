import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchCalendar } from "../../services/analyticsService";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

const LEVEL_STYLE = [
  "bg-[var(--track)] text-[var(--text-faint)]",
  "bg-[var(--accent)]/35 text-[var(--text)]",
  "bg-[var(--accent)]/65 text-[var(--accent-fg)]",
  "bg-[var(--accent)] text-[var(--accent-fg)]",
];

const ConsistencyCalendar = ({ initial }) => {
  const now = new Date();
  const [offset, setOffset] = useState(0);

  const target = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  const year = target.getFullYear();
  const month = target.getMonth();

  const { data: cal, isLoading } = useQuery({
    queryKey: ["journals", "calendar", year, month],
    queryFn: () => fetchCalendar(year, month),
    initialData: offset === 0 ? initial : undefined,
    staleTime: 2 * 60 * 1000,
  });

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-semibold">{cal?.label ?? "Consistency"}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setOffset((o) => o + 1)}
            className="grid h-10 w-10 place-items-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)]"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setOffset((o) => Math.max(0, o - 1))}
            disabled={offset === 0}
            className="grid h-10 w-10 place-items-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)] disabled:opacity-30"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {isLoading && !cal ? (
        <div className="h-56 animate-pulse rounded-xl bg-[var(--surface-subtle)]" />
      ) : (
        /*
         * Grid and summary sit side by side on wide screens. The grid is capped
         * at 420px: stretching 7 columns across a full-width card produced
         * absurd 150px squares — a calendar should read as a compact heatmap.
         */
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="w-full max-w-[420px] shrink-0">
            <div className="grid grid-cols-7 gap-1.5">
              {DOW.map((d, i) => (
                <div key={i} className="pb-1 text-center text-xs font-medium text-[var(--text-faint)]">{d}</div>
              ))}
              {cal.weeks.flat().map((cell, i) =>
                cell === null ? (
                  <div key={i} />
                ) : (
                  <div
                    key={i}
                    title={`${cell.day}: ${cell.count} ${cell.count === 1 ? "entry" : "entries"}`}
                    className={`grid aspect-square max-h-12 place-items-center rounded-lg text-xs font-medium transition ${LEVEL_STYLE[cell.level]}`}
                  >
                    {cell.day}
                  </div>
                )
              )}
            </div>

            <div className="mt-3 flex items-center justify-end gap-1.5">
              <span className="text-xs text-[var(--text-faint)]">Less</span>
              {[0, 1, 2, 3].map((l) => (
                <span key={l} className={`h-3 w-3 rounded-sm ${LEVEL_STYLE[l].split(" ")[0]}`} />
              ))}
              <span className="text-xs text-[var(--text-faint)]">More</span>
            </div>
          </div>

          <div className="flex flex-1 gap-3 md:flex-col md:gap-4">
            <div className="flex-1 rounded-xl bg-[var(--surface-subtle)] px-4 py-3">
              <p className="text-xs text-[var(--text-muted)]">Journal Entries</p>
              <p className="text-2xl font-bold text-[var(--accent)]">{cal.totalEntries}</p>
            </div>
            <div className="flex-1 rounded-xl bg-[var(--surface-subtle)] px-4 py-3">
              <p className="text-xs text-[var(--text-muted)]">Avg per Active Day</p>
              <p className="text-2xl font-bold text-[var(--ring-depth)]">{cal.avgPerDay}</p>
            </div>
            <div className="hidden flex-1 rounded-xl bg-[var(--surface-subtle)] px-4 py-3 md:block">
              <p className="text-xs text-[var(--text-muted)]">Active Days</p>
              <p className="text-2xl font-bold">{cal.activeDays}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ConsistencyCalendar;
