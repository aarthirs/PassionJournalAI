const MetricBar = ({ icon, label, value, display, color = "var(--accent)" }) => (
  <div className="flex items-center gap-3">
    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="truncate text-sm text-[var(--text-muted)]">{label}</span>
        <span className="shrink-0 text-sm font-semibold">{display}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--track)]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            background: color,
            transition: "width 700ms cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
    </div>
  </div>
);

export default MetricBar;
