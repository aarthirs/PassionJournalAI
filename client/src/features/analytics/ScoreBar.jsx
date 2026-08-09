const ScoreBar = ({ label, value, color }) => (
  <div>
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--track)]">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color,
                 transition: "width 700ms cubic-bezier(0.4,0,0.2,1)" }}
      />
    </div>
  </div>
);

export default ScoreBar;
