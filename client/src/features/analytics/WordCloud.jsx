/**
 * Lightweight word cloud: font size scales with frequency, laid out as inline
 * flow rather than a packing algorithm. Readable, responsive, no dependency.
 */
const WordCloud = ({ words = [] }) => {
  if (words.length === 0) return null;

  const max = Math.max(...words.map((w) => w.count));
  const min = Math.min(...words.map((w) => w.count));
  const scale = (c) => {
    if (max === min) return 1;
    return 0.8 + ((c - min) / (max - min)) * 1.1; // 0.8rem -> 1.9rem
  };

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow)]">
      <h3 className="mb-4 font-semibold">What You Write About</h3>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
        {words.map((w, i) => (
          <span
            key={w.word}
            title={`${w.count} mentions`}
            className={i % 3 === 0 ? "text-[var(--accent)]" : i % 3 === 1 ? "text-[var(--text)]" : "text-[var(--text-muted)]"}
            style={{ fontSize: `${scale(w.count)}rem`, fontWeight: w.count === max ? 700 : 500, lineHeight: 1.3 }}
          >
            {w.word}
          </span>
        ))}
      </div>
    </section>
  );
};

export default WordCloud;
