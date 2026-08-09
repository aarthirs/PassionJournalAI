import { useState, useEffect, useRef, useCallback } from "react";
import { Brain, Plus, Pin, LogOut, BarChart3, Settings, Filter } from "lucide-react";

import useHistory from "./useHistory";
import useDebounce from "../../hooks/useDebounce";
import useAuth from "../../hooks/useAuth";
import SearchBar from "./SearchBar";
import HistoryItem from "./HistoryItem";
import { groupByDate } from "../../utils/groupByDate";

const HistorySidebar = ({ activeId, onSelect, onNew }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(undefined);
  const debouncedSearch = useDebounce(search, 350);
  const { user, logout } = useAuth();

  const {
    items, pinnedItems, isLoading, isError,
    hasNextPage, isFetchingNextPage, fetchNextPage,
    rename, togglePin, toggleFavorite, toggleArchive, remove,
  } = useHistory({ search: debouncedSearch, filter });

  // Infinite scroll: when this sentinel scrolls into view, load the next page.
  const sentinelRef = useRef(null);
  const handleObserve = useCallback(
    (entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserve, { rootMargin: "120px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserve]);

  const actions = { onRename: rename, onTogglePin: togglePin, onToggleFavorite: toggleFavorite, onToggleArchive: toggleArchive, onDelete: remove };
  const groups = groupByDate(items);
  const showPinned = !debouncedSearch && !filter && pinnedItems.length > 0;

  return (
    <div className="flex h-full flex-col border-r border-[var(--border)] bg-[var(--surface-panel)]">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
        <Brain size={26} className="text-[var(--accent)]" />
        <h1 className="text-lg font-bold tracking-wide">Reflect AI</h1>
      </div>

      <div className="space-y-3 px-3 py-3">
        <button
          onClick={onNew}
          className="flex w-full items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--surface-subtle)]"
        >
          <Plus size={16} /> New Reflection
        </button>

        <SearchBar value={search} onChange={setSearch} />

        <div className="flex gap-1">
          <FilterChip active={!filter} onClick={() => setFilter(undefined)} label="All" />
          <FilterChip active={filter === "favorite"} onClick={() => setFilter("favorite")} label="Favorites" />
          <FilterChip active={filter === "archived"} onClick={() => setFilter("archived")} label="Archived" />
        </div>
      </div>

      {/* Scrollable history */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {isLoading && <SkeletonList />}

        {isError && (
          <p className="px-2 py-4 text-sm text-red-400">Couldn't load your history.</p>
        )}

        {!isLoading && !isError && items.length === 0 && !showPinned && (
          <div className="px-2 py-8 text-center">
            <Filter size={28} className="mx-auto mb-3 text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-muted)]">
              {debouncedSearch ? "No matching reflections." : "No reflections yet."}
            </p>
          </div>
        )}

        {showPinned && (
          <section className="mb-3">
            <GroupLabel>
              <Pin size={11} /> Pinned
            </GroupLabel>
            <div className="space-y-0.5">
              {pinnedItems.map((e) => (
                <HistoryItem key={e.id} entry={e} active={e.id === activeId} onSelect={onSelect} {...actions} />
              ))}
            </div>
          </section>
        )}

        {groups.map((group) => (
          <section key={group.label} className="mb-3">
            <GroupLabel>{group.label}</GroupLabel>
            <div className="space-y-0.5">
              {group.items.map((e) => (
                <HistoryItem key={e.id} entry={e} active={e.id === activeId} onSelect={onSelect} {...actions} />
              ))}
            </div>
          </section>
        ))}

        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="h-6" />
        {isFetchingNextPage && (
          <p className="py-2 text-center text-xs text-[var(--text-muted)]">Loading more…</p>
        )}
      </div>

      {/* Footer: nav + profile */}
      <div className="border-t border-[var(--border)] px-3 py-3">
        <FooterLink icon={<BarChart3 size={16} />} label="Trend Analysis" disabled title="Coming in Phase 9" />
        <FooterLink icon={<Settings size={16} />} label="Settings" disabled title="Coming in Phase 10" />

        <div className="mt-2 flex items-center gap-2 rounded-lg px-2 py-2">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="h-8 w-8 rounded-full" />
          ) : (
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-[var(--text-muted)]">{user?.email}</p>
          </div>
          <button onClick={logout} className="rounded p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--text)]" title="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const GroupLabel = ({ children }) => (
  <p className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
    {children}
  </p>
);

const FilterChip = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
      active ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)] hover:bg-[var(--surface-subtle)]"
    }`}
  >
    {label}
  </button>
);

const FooterLink = ({ icon, label, disabled, title }) => (
  <button
    disabled={disabled}
    title={title}
    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--text)] transition hover:bg-[var(--surface-subtle)] disabled:cursor-not-allowed disabled:opacity-40"
  >
    {icon} {label}
  </button>
);

const SkeletonList = () => (
  <div className="space-y-2 px-2 py-2">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-8 animate-pulse rounded-lg bg-[var(--surface-subtle)]" />
    ))}
  </div>
);

export default HistorySidebar;
