import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

import HistorySidebar from "../features/history/HistorySidebar";

/**
 * Shared application shell.
 *
 * WHY: previously only the chat page had the sidebar, so Analytics and Settings
 * rendered as narrow centred columns floating in empty space. A persistent rail
 * is the standard SaaS pattern (Linear, Notion, ChatGPT) — navigation stays
 * available everywhere and the content region is sized by the layout rather than
 * by an arbitrary max-width.
 *
 * Conversation selection lives in the URL (`/dashboard?c=<id>`), so a history
 * click works identically from any page, and threads become bookmarkable and
 * back-button friendly.
 */
const AppShell = ({ activeId = null, header, children, rightRail = null }) => {
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();

  const selectThread = (entry) => {
    navigate(`/dashboard?c=${entry.id}`);
    setNavOpen(false);
  };
  const startNew = () => {
    navigate("/dashboard");
    setNavOpen(false);
  };

  const sidebar = (
    <HistorySidebar activeId={activeId} onSelect={selectThread} onNew={startNew} />
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      {/* Persistent rail from lg up; slightly wider on very large screens. */}
      <aside className="hidden w-[272px] shrink-0 lg:block 2xl:w-[300px]">{sidebar}</aside>

      {/* Mobile / tablet drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setNavOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[85vw] max-w-[300px] shadow-2xl">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {header?.({ openNav: () => setNavOpen(true) })}
        {children}
      </div>

      {rightRail}
    </div>
  );
};

// Shared hamburger so every page's header behaves the same on small screens.
export const NavButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)] lg:hidden"
    aria-label="Open navigation"
  >
    <Menu size={20} />
  </button>
);

export default AppShell;
