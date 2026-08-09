const COLORS = [
  "var(--ring-mood)", "var(--ring-streak)", "var(--chart-stress)",
  "var(--ring-depth)", "var(--success)", "var(--accent)",
];

const EmotionDistribution = ({ emotions = [] }) => (
  <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow)]">
    <h3 className="mb-4 font-semibold">Emotion Distribution</h3>

    {emotions.length === 0 ? (
      <p className="text-sm text-[var(--text-muted)]">No emotions recorded in this range yet.</p>
    ) : (
      <div className="space-y-3">
        {emotions.map((e, i) => (
          <div key={e.label}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="text-sm">{e.label}</span>
              <span className="text-sm font-medium text-[var(--text-muted)]">{e.percent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--track)]">
              <div
                className="h-full rounded-full"
                style={{ width: `${e.percent}%`, background: COLORS[i % COLORS.length],
                         transition: "width 700ms cubic-bezier(0.4,0,0.2,1)" }}
              />
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

export default EmotionDistribution;
