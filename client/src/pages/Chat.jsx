import { useState, useCallback } from "react";

import HistorySidebar from "../features/history/HistorySidebar";
import InsightsPanel from "../features/insights/InsightsPanel";
import ChatHeader from "../features/chat/ChatHeader";
import MessageList from "../features/chat/MessageList";
import Composer from "../features/chat/Composer";
import useChat from "../features/chat/useChat";
import useAuth from "../hooks/useAuth";
import useLegacyMigration from "../hooks/useLegacyMigration";
import Toast from "../components/common/Toast";

/**
 * Three-column shell.
 *   xl and up : history | conversation | insights   (all visible)
 *   lg        : history | conversation              (insights in a drawer)
 *   below lg  : conversation only                   (both in drawers)
 */
const Chat = () => {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);

  const migratedCount = useLegacyMigration();
  const [migrationDismissed, setMigrationDismissed] = useState(false);

  // When the first message creates a thread, adopt its id without refetching.
  const onThreadCreated = useCallback((id) => setActiveId(id), []);

  const { messages, thread, loading, sending, error, supportNotice, send } = useChat({
    journalId: activeId,
    onThreadCreated,
  });

  const selectThread = (entry) => { setActiveId(entry.id); setSidebarOpen(false); };
  const startNew = () => { setActiveId(null); setSidebarOpen(false); };

  const sidebar = (
    <HistorySidebar activeId={activeId} onSelect={selectThread} onNew={startNew} />
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      {/* LEFT — history */}
      <aside className="hidden w-[280px] shrink-0 lg:block">{sidebar}</aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[280px] shadow-2xl">{sidebar}</aside>
        </div>
      )}

      {/* CENTER — conversation */}
      <main className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          userName={user?.name}
          mood={thread?.analysis?.mood}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenInsights={() => setInsightsOpen(true)}
        />

        <MessageList
          messages={messages}
          sending={sending}
          loading={loading}
          supportNotice={supportNotice}
          userName={user?.name}
        />

        {error && (
          <p className="px-4 pb-2 text-sm text-[var(--danger)] lg:px-8">{error}</p>
        )}

        <Composer onSend={send} disabled={sending} />
      </main>

      {/* RIGHT — insights */}
      <aside className="hidden w-[340px] shrink-0 xl:block">
        <InsightsPanel analysis={thread?.analysis} />
      </aside>

      {insightsOpen && (
        <div className="fixed inset-0 z-40 xl:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setInsightsOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-[340px] max-w-[90vw] shadow-2xl">
            <InsightsPanel analysis={thread?.analysis} onClose={() => setInsightsOpen(false)} />
          </aside>
        </div>
      )}

      {migratedCount > 0 && !migrationDismissed && (
        <Toast
          message={`Moved ${migratedCount} saved entries into your account.`}
          type="success"
          onClose={() => setMigrationDismissed(true)}
        />
      )}
    </div>
  );
};

export default Chat;
