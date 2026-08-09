const StatCard = ({ icon, label, value, suffix, sub, deltaLabel }) => (
  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow)]">
    <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
      {icon}
    </div>
    <p className="text-sm text-[var(--text-muted)]">{label}</p>
    <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
      <span className="text-2xl font-bold">{value}</span>
      {suffix && <span className="text-sm text-[var(--text-muted)]">{suffix}</span>}
      {deltaLabel && <span className="text-xs font-medium text-[var(--success)]">{deltaLabel}</span>}
    </div>
    {sub && <p className="mt-0.5 text-xs text-[var(--text-faint)]">{sub}</p>}
  </div>
);

export default StatCard;
