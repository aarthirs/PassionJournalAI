import { useEffect, useRef, useState } from "react";
import { Feather, ShieldAlert } from "lucide-react";

import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import useTypewriter from "./useTypewriter";

// Animates only the newest AI message; older ones render instantly.
const AnimatedAiBubble = ({ message, onTick }) => {
  const { shown } = useTypewriter(message.content, { enabled: true });
  useEffect(() => { onTick?.(); }, [shown, onTick]);
  return <MessageBubble message={message} displayText={shown} />;
};

const EmptyState = ({ name }) => (
  <div className="flex h-full flex-col items-center justify-center px-6 text-center">
    <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
      <Feather size={26} />
    </div>
    <h2 className="mb-2 text-xl font-semibold">
      What's on your mind{name ? `, ${name.split(" ")[0]}` : ""}?
    </h2>
    <p className="max-w-sm text-sm text-[var(--text-muted)]">
      Write whatever you're carrying today — a win, a worry, a half-formed thought.
      I'll reflect it back with you.
    </p>
  </div>
);

const MessageList = ({ messages, sending, loading, supportNotice, userName }) => {
  const bottomRef = useRef(null);
  const scrollerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Only auto-scroll if the user is already near the bottom — otherwise we'd
  // yank them away while they're reading earlier messages.
  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    setAutoScroll(nearBottom);
  };

  const stickToBottom = () => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(stickToBottom, [messages.length, sending, autoScroll]);

  if (loading) {
    return (
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6 lg:px-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`flex gap-3 ${i % 2 ? "flex-row-reverse" : ""}`}>
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-[var(--surface-subtle)]" />
            <div
              className="h-16 animate-pulse rounded-2xl bg-[var(--surface-subtle)]"
              style={{ width: `${45 + i * 12}%` }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0 && !sending) {
    return (
      <div className="flex-1 overflow-y-auto">
        <EmptyState name={userName} />
      </div>
    );
  }

  const lastIndex = messages.length - 1;

  return (
    <div
      ref={scrollerRef}
      onScroll={handleScroll}
      className="flex-1 space-y-5 overflow-y-auto px-4 py-6 lg:px-8"
    >
      {messages.map((m, idx) => {
        const isNewestAi = idx === lastIndex && m.role === "ai" && !String(m.id).startsWith("temp-");
        return isNewestAi ? (
          <AnimatedAiBubble key={m.id} message={m} onTick={stickToBottom} />
        ) : (
          <MessageBubble key={m.id} message={m} />
        );
      })}

      {sending && (
        <div className="flex gap-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-fg)]">
            <Feather size={16} />
          </div>
          <TypingIndicator />
        </div>
      )}

      {supportNotice && (
        <div className="flex items-start gap-3 rounded-xl border border-[var(--accent)]/40 bg-[var(--accent-soft)] p-4">
          <ShieldAlert size={18} className="mt-0.5 shrink-0 text-[var(--accent)]" />
          <p className="text-sm leading-relaxed text-[var(--text)]">{supportNotice}</p>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
