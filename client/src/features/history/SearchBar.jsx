import { Search, X } from "lucide-react";

const SearchBar = ({ value, onChange }) => (
  <div className="relative">
    <Search
      size={16}
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
    />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search reflections..."
      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] py-2 pl-9 pr-8 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
    />
    {value && (
      <button
        onClick={() => onChange("")}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text)]"
        aria-label="Clear search"
      >
        <X size={14} />
      </button>
    )}
  </div>
);

export default SearchBar;
