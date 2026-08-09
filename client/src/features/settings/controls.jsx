import { Check } from "lucide-react";

export const Section = ({ icon, title, description, children, danger }) => (
  <section
    className={`rounded-2xl border p-5 shadow-[var(--shadow)] ${
      danger
        ? "border-[var(--danger)]/40 bg-[var(--danger)]/5"
        : "border-[var(--border)] bg-[var(--surface-card)]"
    }`}
  >
    <header className="mb-4">
      <h2 className={`flex items-center gap-2 font-semibold ${danger ? "text-[var(--danger)]" : ""}`}>
        {icon}
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>}
    </header>
    {children}
  </section>
);

export const Row = ({ label, hint, children, badge }) => (
  <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-3 last:border-0 last:pb-0">
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium">{label}</p>
        {badge}
      </div>
      {hint && <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-faint)]">{hint}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

// Marks settings that are saved but not yet acted on, so nothing is oversold.
export const SoonBadge = () => (
  <span className="rounded-full bg-[var(--surface-subtle)] px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-[var(--text-faint)]">
    saved, not yet active
  </span>
);

export const Toggle = ({ checked, onChange, disabled }) => (
  <button
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${
      checked ? "bg-[var(--accent)]" : "bg-[var(--track)]"
    }`}
  >
    <span
      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
        checked ? "left-[22px]" : "left-0.5"
      }`}
    />
  </button>
);

export const SegmentedControl = ({ options, value, onChange }) => (
  <div className="flex gap-1 rounded-xl bg-[var(--surface-subtle)] p-1">
    {options.map((o) => (
      <button
        key={o.value}
        onClick={() => onChange(o.value)}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
          value === o.value
            ? "bg-[var(--accent)] text-[var(--accent-fg)]"
            : "text-[var(--text-muted)] hover:text-[var(--text)]"
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export const Select = ({ options, value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="rounded-xl border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--accent)]"
  >
    {options.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

export const SavedTick = ({ show }) => (
  <span
    className={`flex items-center gap-1 text-xs text-[var(--success)] transition-opacity ${
      show ? "opacity-100" : "opacity-0"
    }`}
  >
    <Check size={13} /> Saved
  </span>
);
