import { useState, useRef, useEffect } from "react";
import { Paperclip, Mic, ArrowUp } from "lucide-react";

const MAX = 5000;

const Composer = ({ onSend, disabled }) => {
  const [text, setText] = useState("");
  const areaRef = useRef(null);

  // Grow the textarea with content, up to a cap.
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [text]);

  const submit = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText("");
  };

  const onKeyDown = (e) => {
    // Enter sends; Shift+Enter makes a new line.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="shrink-0 border-t border-[var(--border)] px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 lg:px-3 lg:py-4">
      <div className="mx-auto flex w-full max-w-[1140px] items-end gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2.5 shadow-[var(--shadow)] transition focus-within:border-[var(--accent)]">
        <textarea
          ref={areaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          onKeyDown={onKeyDown}
          disabled={disabled}
          placeholder="Write today's thoughts..."
          className="max-h-[200px] min-h-[28px] flex-1 resize-none bg-transparent py-1 text-[0.95rem] outline-none placeholder:text-[var(--text-faint)] disabled:opacity-60"
        />

        <div className="flex items-center gap-1 pb-0.5">
          {/* Attachments + voice are Phase 11+; shown per the mockup, clearly disabled. */}
          <IconButton title="Attachments (coming soon)" disabled>
            <Paperclip size={17} />
          </IconButton>
          <IconButton title="Voice input (coming soon)" disabled>
            <Mic size={17} />
          </IconButton>
          <button
            onClick={submit}
            disabled={disabled || !text.trim()}
            title="Send"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-fg)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>

      <div className="mx-auto mt-2 flex w-full max-w-[1140px] items-center justify-between px-1">
        <p className="text-xs text-[var(--text-faint)]">
          Reflect AI offers supportive reflection, not professional care.
        </p>
        {text.length > MAX * 0.8 && (
          <span className="text-xs text-[var(--text-faint)]">{text.length}/{MAX}</span>
        )}
      </div>
    </div>
  );
};

const IconButton = ({ children, title, disabled }) => (
  <button
    title={title}
    disabled={disabled}
    className="hidden h-10 w-10 place-items-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)] disabled:cursor-not-allowed disabled:opacity-40 sm:grid"
  >
    {children}
  </button>
);

export default Composer;
