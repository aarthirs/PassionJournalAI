import { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal, Pin, PinOff, Star, Archive,
  ArchiveRestore, Pencil, Trash2, Check, X,
} from "lucide-react";

const timeLabel = (iso) => {
  const d = new Date(iso);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const day = new Date(d); day.setHours(0, 0, 0, 0);
  const diff = Math.round((today - day) / 86400000);
  if (diff <= 0) return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (diff <= 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
};

const HistoryItem = ({ entry, active, onSelect, onRename, onTogglePin, onToggleFavorite, onToggleArchive, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.title);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  // Close the action menu when clicking anywhere outside it.
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commitRename = () => {
    const t = draft.trim();
    if (t && t !== entry.title) onRename(entry.id, t);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 rounded-lg bg-[var(--surface-subtle)] px-2 py-1.5">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") { setDraft(entry.title); setEditing(false); }
          }}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          maxLength={120}
        />
        <button onClick={commitRename} className="rounded p-1 text-green-400 hover:bg-[var(--surface-subtle)]"><Check size={14} /></button>
        <button onClick={() => { setDraft(entry.title); setEditing(false); }} className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--surface-subtle)]"><X size={14} /></button>
      </div>
    );
  }

  return (
    <div
      className={`group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition cursor-pointer ${
        active ? "bg-[var(--surface-subtle)] text-[var(--text)]" : "text-[var(--text)] hover:bg-[var(--surface-subtle)]"
      }`}
      onClick={() => onSelect?.(entry)}
    >
      {entry.favorite && <Star size={12} className="shrink-0 fill-yellow-400 text-yellow-400" />}
      <span className="min-w-0 flex-1 truncate">{entry.title}</span>

      <span className="shrink-0 text-xs text-[var(--text-muted)] group-hover:opacity-0">
        {timeLabel(entry.createdAt)}
      </span>

      <button
        onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
        className="absolute right-1 rounded p-1 opacity-0 transition hover:bg-[var(--surface-subtle)] group-hover:opacity-100"
        aria-label="Entry actions"
      >
        <MoreHorizontal size={16} />
      </button>

      {menuOpen && (
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-1 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-card)] py-1 shadow-2xl"
        >
          <MenuItem icon={<Pencil size={14} />} label="Rename" onClick={() => { setEditing(true); setMenuOpen(false); }} />
          <MenuItem
            icon={entry.pinned ? <PinOff size={14} /> : <Pin size={14} />}
            label={entry.pinned ? "Unpin" : "Pin"}
            onClick={() => { onTogglePin(entry); setMenuOpen(false); }}
          />
          <MenuItem
            icon={<Star size={14} className={entry.favorite ? "fill-yellow-400 text-yellow-400" : ""} />}
            label={entry.favorite ? "Remove favorite" : "Favorite"}
            onClick={() => { onToggleFavorite(entry); setMenuOpen(false); }}
          />
          <MenuItem
            icon={entry.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
            label={entry.archived ? "Unarchive" : "Archive"}
            onClick={() => { onToggleArchive(entry); setMenuOpen(false); }}
          />
          <div className="my-1 h-px bg-[var(--surface-subtle)]" />
          <MenuItem
            icon={<Trash2 size={14} />}
            label="Delete"
            danger
            onClick={() => { onDelete(entry.id); setMenuOpen(false); }}
          />
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-[var(--surface-subtle)] ${
      danger ? "text-red-400" : "text-[var(--text)]"
    }`}
  >
    {icon}
    {label}
  </button>
);

export default HistoryItem;
