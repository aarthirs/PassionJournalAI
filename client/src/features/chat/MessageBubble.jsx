import { Feather } from "lucide-react";
import Markdown from "../../utils/markdown.jsx";
import useAuth from "../../hooks/useAuth";

const timeOf = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/**
 * `animate` reveals AI text progressively (see useTypewriter in MessageList).
 * True token-by-token streaming from the model arrives in Phase 8.
 */
const MessageBubble = ({ message, displayText }) => {
  const isUser = message.role === "user";
  const { user } = useAuth();
  const text = displayText ?? message.content;

  const Avatar = isUser ? (
    user?.avatar ? (
      <img src={user.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full" />
    ) : (
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
        {(user?.name || "U").charAt(0).toUpperCase()}
      </div>
    )
  ) : (
    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-fg)]">
      <Feather size={16} />
    </div>
  );

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {Avatar}

      <div className={`flex min-w-0 max-w-[78%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-[0.95rem] ${
            isUser
              ? "bg-[var(--bubble-user)] text-[var(--bubble-user-text)]"
              : "bg-[var(--bubble-ai)] text-[var(--bubble-ai-text)]"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
          ) : (
            <Markdown content={text} />
          )}
        </div>

        <span className="mt-1 px-1 text-xs text-[var(--text-faint)]">
          {timeOf(message.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
