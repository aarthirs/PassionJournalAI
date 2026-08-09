const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 rounded-2xl bg-[var(--bubble-ai)] px-4 py-3">
    {[0, 150, 300].map((delay) => (
      <span
        key={delay}
        className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-faint)]"
        style={{ animationDelay: `${delay}ms`, animationDuration: "1s" }}
      />
    ))}
  </div>
);

export default TypingIndicator;
