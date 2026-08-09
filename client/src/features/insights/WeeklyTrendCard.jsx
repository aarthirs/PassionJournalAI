import { TrendingUp } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from "recharts";
import InsightCard from "./InsightCard";

const Legend = () => (
  <div className="mb-2 flex items-center gap-3">
    {[
      ["Mood", "var(--chart-mood)"],
      ["Stress", "var(--chart-stress)"],
      ["Energy", "var(--chart-energy)"],
    ].map(([label, color]) => (
      <span key={label} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        {label}
      </span>
    ))}
  </div>
);

const WeeklyTrendCard = ({ series, stats }) => {
  const hasData = series.some((d) => d.mood !== null);

  return (
    <InsightCard
      icon={<TrendingUp size={13} />}
      title="Weekly Trend"
      action={<span className="text-xs text-[var(--text-faint)]">Last 7 days</span>}
    >
      {hasData ? (
        <>
          <Legend />

          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 5, right: 4, left: 4, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "var(--text-faint)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--text)",
                  }}
                />
                {/* connectNulls keeps the line continuous across days with no entry. */}
                <Line type="monotone" dataKey="mood" stroke="var(--chart-mood)" strokeWidth={2} dot={{ r: 2.5 }} connectNulls />
                <Line type="monotone" dataKey="stress" stroke="var(--chart-stress)" strokeWidth={2} dot={{ r: 2.5 }} connectNulls />
                <Line type="monotone" dataKey="energy" stroke="var(--chart-energy)" strokeWidth={2} dot={{ r: 2.5 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[var(--border)] pt-3 text-center">
            <Stat label="Avg Mood" value={stats.avgMood} accent />
            <Stat label="Best Day" value={stats.bestDay} />
            <Stat label="Entries" value={stats.entries} />
          </div>
        </>
      ) : (
        <p className="py-6 text-center text-sm text-[var(--text-muted)]">
          Journal across a few days to see your trend.
        </p>
      )}

      <button
        disabled
        title="Full analytics arrive in Phase 9"
        className="mt-3 w-full rounded-xl border border-[var(--border)] py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        View Full Analysis
      </button>
    </InsightCard>
  );
};

const Stat = ({ label, value, accent }) => (
  <div>
    <p className="text-[0.7rem] text-[var(--text-faint)]">{label}</p>
    <p className={`text-sm font-semibold ${accent ? "text-[var(--accent)]" : ""}`}>{value}</p>
  </div>
);

export default WeeklyTrendCard;
