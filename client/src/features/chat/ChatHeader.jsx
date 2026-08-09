import { Menu, Sun, Moon, BarChart3 } from "lucide-react";
import useTheme from "../../hooks/useTheme";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const ChatHeader = ({ userName, mood, onOpenSidebar, onOpenInsights }) => {
  const { resolved, toggle } = useTheme();

  return (
    <header className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3.5 lg:px-8">
      <button
        onClick={onOpenSidebar}
        className="grid h-9 w-9 place-items-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)] lg:hidden"
        aria-label="Open history"
      >
        <Menu size={20} />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold leading-tight">
          {greeting()}{userName ? `, ${userName.split(" ")[0]}` : ""}
        </h1>
        <p className="truncate text-sm text-[var(--text-muted)]">What's on your mind today?</p>
      </div>

      {mood && (
        <span className="hidden items-center gap-1.5 rounded-full bg-[var(--surface-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
          {mood}
        </span>
      )}

      <button
        onClick={toggle}
        title={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
        className="grid h-9 w-9 place-items-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)]"
      >
        {resolved === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      <button
        onClick={onOpenInsights}
        title="Insights"
        className="grid h-9 w-9 place-items-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)] xl:hidden"
      >
        <BarChart3 size={17} />
      </button>
    </header>
  );
};

export default ChatHeader;
