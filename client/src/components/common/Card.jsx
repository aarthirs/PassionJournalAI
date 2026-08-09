const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow)] ${className}`}
  >
    {children}
  </div>
);

export default Card;
