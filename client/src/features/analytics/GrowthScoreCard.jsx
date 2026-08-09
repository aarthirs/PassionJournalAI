import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";
import { ArrowUp, ArrowDown } from "lucide-react";
import ScoreBar from "./ScoreBar";

const GrowthScoreCard = ({ stats, growth, series }) => {
  const delta = stats.growthDelta;
  const monthsWithData = series.filter((m) => m.score !== null).length;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow)]">
      <div className="mb-1 flex items-start justify-between gap-3">
        <h3 className="font-semibold">Overall Growth Score</h3>
      </div>

      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-4xl font-bold text-[var(--accent)]">{stats.growthScore}</span>
        <span className="text-sm text-[var(--text-muted)]">out of 100</span>
      </div>

      {delta !== null && delta !== undefined && (
        <p className={`mt-1 flex items-center gap-1 text-sm font-medium ${delta >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
          {delta >= 0 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
          {Math.abs(delta)} points this month
        </p>
      )}

      {/*
        * With only one or two months of data a line chart is misleading — there
        * is nothing to trend. Say so instead of drawing a lone floating dot.
        */}
      {monthsWithData < 2 ? (
        <div className="mt-4 grid h-40 place-items-center rounded-xl border border-dashed border-[var(--border)] px-4 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            Your growth trend appears once you've journaled across two or more months.
          </p>
        </div>
      ) : (
      <div className="mt-4 h-40 w-full sm:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 13, fill: "var(--text-faint)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface-card)", border: "1px solid var(--border)",
                borderRadius: 12, fontSize: 13, color: "var(--text)",
              }}
              formatter={(v) => [v === null ? "no entries" : `${v}/100`, "Growth"]}
            />
            <Area
              type="monotone" dataKey="score"
              stroke="var(--accent)" strokeWidth={2}
              fill="url(#growthFill)" connectNulls
              dot={{ r: 3, fill: "var(--accent)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}

      {/* Sub-scores explain WHY the composite is what it is. */}
      <div className="mt-4 grid gap-4 border-t border-[var(--border)] pt-4 sm:grid-cols-3">
        <ScoreBar label="Reflection Quality" value={growth.reflectionQuality} color="var(--accent)" />
        <ScoreBar label="Consistency" value={growth.consistency} color="var(--ring-depth)" />
        <ScoreBar label="Insights" value={growth.insights} color="var(--ring-streak)" />
      </div>
    </section>
  );
};

export default GrowthScoreCard;
