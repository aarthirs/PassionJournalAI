// Big single-number trend card (mockup's "Stress Trend 4.2 out of 10").
const TrendStatCard = ({ title, trend, invert = false }) => {
  if (!trend?.hasData) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow)]">
        <h3 className="mb-4 font-semibold">{title}</h3>
        <p className="text-sm text-[var(--text-muted)]">Not enough entries in this range yet.</p>
      </section>
    );
  }

  const outOfTen = Math.round(trend.current / 10 * 10) / 10;
  const improving = trend.direction === "improving";
  const worsening = trend.direction === "worsening";

  return (
    <section className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow)]">
      <h3 className="mb-4 font-semibold">{title}</h3>

      <div className="flex flex-1 flex-col items-center justify-center py-2 text-center">
        <span className={`text-4xl font-bold ${invert ? "text-[var(--chart-stress)]" : "text-[var(--accent)]"}`}>
          {outOfTen}
        </span>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          out of 10
          {trend.delta !== null && trend.delta !== 0 && (
            <> ({trend.delta > 0 ? "↑" : "↓"}{Math.abs(Math.round(trend.delta / 10 * 10) / 10)} over range)</>
          )}
        </p>

        {(improving || worsening) && (
          <p className={`mt-3 flex items-center gap-1.5 text-sm ${improving ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Trend {improving ? "improving" : "worth watching"}
          </p>
        )}
      </div>
    </section>
  );
};

export default TrendStatCard;
