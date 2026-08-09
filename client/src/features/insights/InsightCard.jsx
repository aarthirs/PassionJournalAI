// Shared shell for the insight cards: subtle glass surface, rounded, hairline border.
const InsightCard = ({ icon, title, action, children }) => (
  <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow)]">
    <header className="mb-3 flex items-center justify-between gap-2">
      <h3 className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        <span className="text-[var(--accent)]">{icon}</span>
        {title}
      </h3>
      {action}
    </header>
    {children}
  </section>
);

export default InsightCard;
