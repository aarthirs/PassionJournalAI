import { useState } from "react";
import { Menu, X } from "lucide-react";

import HistorySidebar from "../features/history/HistorySidebar";
import useJournal from "../hooks/useJournal";

// Desktop: fixed sidebar + content. Mobile/tablet: sidebar becomes an overlay
// drawer opened by the hamburger button (full 3-column layout lands in Phase 7).
const DashboardLayout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { activeEntry, selectEntry, startNew } = useJournal();

  const handleSelect = (entry) => { selectEntry(entry); setDrawerOpen(false); };
  const handleNew = () => { startNew(); setDrawerOpen(false); };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 lg:block">
        <HistorySidebar activeId={activeEntry?.id} onSelect={handleSelect} onNew={handleNew} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 shadow-2xl">
            <HistorySidebar activeId={activeEntry?.id} onSelect={handleSelect} onNew={handleNew} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3 lg:hidden">
          <button
            onClick={() => setDrawerOpen((o) => !o)}
            className="rounded-lg p-2 transition hover:bg-white/10"
            aria-label="Toggle history"
          >
            {drawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-semibold">Reflect AI</span>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
