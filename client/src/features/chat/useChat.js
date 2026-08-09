import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchConversation, sendMessage as apiSend } from "../../services/chatService";

/**
 * Owns one conversation's messages.
 *
 * Deliberately local state rather than React Query: a conversation is a linear
 * append-only log we mutate optimistically on every send, so cache-key
 * invalidation buys us nothing here. React Query still owns the SIDEBAR list,
 * which we invalidate after each send so titles/order refresh.
 */
export const useChat = ({ journalId, onThreadCreated }) => {
  const qc = useQueryClient();
  const [messages, setMessages] = useState([]);
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [supportNotice, setSupportNotice] = useState(null);

  // Load (or reset) whenever the selected conversation changes.
  useEffect(() => {
    let cancelled = false;

    if (!journalId) {
      setMessages([]); setThread(null); setError(""); setSupportNotice(null);
      return;
    }

    setLoading(true);
    fetchConversation(journalId)
      .then((data) => {
        if (cancelled) return;
        setMessages(data.messages);
        setThread(data.thread);
        setError("");
      })
      .catch(() => !cancelled && setError("Couldn't load this conversation."))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [journalId]);

  const send = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      // Optimistic user bubble so typing feels instant.
      const tempId = `temp-${Date.now()}`;
      setMessages((m) => [
        ...m,
        { id: tempId, role: "user", content: trimmed, createdAt: new Date().toISOString() },
      ]);
      setSending(true);
      setError("");
      setSupportNotice(null);

      try {
        const res = await apiSend(journalId, trimmed);
        setThread(res.thread);
        setMessages((m) => [...m, res.aiMessage]);
        if (res.supportNotice) setSupportNotice(res.supportNotice);

        // Refresh the sidebar (new thread, new title, new ordering).
        qc.invalidateQueries({ queryKey: ["journals"] });

        // A brand-new thread now has a real id the parent must track.
        if (!journalId && res.thread?.id) onThreadCreated?.(res.thread.id);
      } catch (err) {
        console.error(err);
        setMessages((m) => m.filter((x) => x.id !== tempId)); // roll back
        setError(
          err?.response?.data?.error || "Couldn't send that message. Please try again."
        );
      } finally {
        setSending(false);
      }
    },
    [journalId, sending, qc, onThreadCreated]
  );

  return { messages, thread, loading, sending, error, supportNotice, send };
};

export default useChat;
