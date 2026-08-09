/**
 * SVG donut gauge.
 *
 * Uses stroke-dasharray/dashoffset: the circle's full circumference becomes the
 * "dash", and we offset it by the unfilled remainder. Rotated -90deg so 0%
 * starts at 12 o'clock. No chart library needed for a shape this simple.
 */
const ProgressRing = ({ value = 0, label, color = "var(--accent)", size = 62, stroke = 5 }) => {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (safe / 100) * c;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-sm font-semibold">
          {safe}
        </span>
      </div>
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
    </div>
  );
};

export default ProgressRing;
