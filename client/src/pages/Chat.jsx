import { useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import AppShell, { NavButton } from "../layout/AppShell";
import InsightsPanel from "../features/insights/InsightsPanel";
import ChatHeader from "../features/chat/ChatHeader";
import MessageList from "../features/chat/MessageList";
import Composer from "../features/chat/Composer";
import BottomSheet from "../components/ui/BottomSheet";
import useChat from "../features/chat/useChat";
import useAuth from "../hooks/useAuth";
import useLegacyMigration from "../hooks/useLegacyMigration";
import Toast from "../components/common/Toast";

const Chat = () => {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  // The active conversation lives in the URL, so it survives refreshes and can
  // be linked to from anywhere (including the sidebar on other pages).
  const activeId = params.get("c");

  const [insightsOpen, setInsightsOpen] = useState(false);
  const migratedCount = useLegacyMigration();
  const [migrationDismissed, setMigrationDismissed] = useState(false);

  // A new thread gets a real id on first send — put it in the URL without
  // adding a history entry, so Back doesn't return to an empty composer.
  const onThreadCreated = useCallback(
    (id) => setParams({ c: id }, { replace: true }),
    [setParams]
  );

  const { messages, thread, loading, sending, error, supportNotice, send } = useChat({
    journalId: activeId,
    onThreadCreated,
  });

  const insights = <InsightsPanel analysis={thread?.analysis} />;

  return (
    <AppShell
      activeId={activeId}
      header={({ openNav }) => (
        <ChatHeader
          userName={user?.name}
          mood={thread?.analysis?.mood}
          onOpenSidebar={openNav}
          onOpenInsights={() => setInsightsOpen(true)}
        />
      )}
      rightRail={
        <aside className="hidden w-[340px] shrink-0 xl:block 2xl:w-[380px]">{insights}</aside>
      }
    >
      <MessageList
        messages={messages}
        sending={sending}
        loading={loading}
        supportNotice={supportNotice}
        userName={user?.name}
      />

      {error && <p className="px-4 pb-2 text-sm text-[var(--danger)] lg:px-8">{error}</p>}

      <Composer onSend={send} disabled={sending} />

      {/* Below xl the insights rail becomes a bottom sheet. */}
      <BottomSheet open={insightsOpen} onClose={() => setInsightsOpen(false)} title="Today's Insights">
        <InsightsPanel analysis={thread?.analysis} onClose={() => setInsightsOpen(false)} />
      </BottomSheet>

      {migratedCount > 0 && !migrationDismissed && (
        <Toast
          message={`Moved ${migratedCount} saved entries into your account.`}
          type="success"
          onClose={() => setMigrationDismissed(true)}
        />
      )}
    </AppShell>
  );
};

export default Chat;
