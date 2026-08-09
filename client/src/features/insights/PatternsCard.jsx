import { Brain, TrendingUp, TrendingDown, Minus, PartyPopper, HeartHandshake } from "lucide-react";
import InsightCard from "./InsightCard";

const DIRECTION = {
  improving: { Icon: TrendingUp, cls: "text-[var(--success)]", word: "improving" },
  worsening: { Icon: TrendingDown, cls: "text-[var(--danger)]", word: "declining" },
  stable: { Icon: Minus, cls: "text-[var(--text-muted)]", word: "steady" },
};

const TrendRow = ({ label, trend }) => {
  // Never render a trend we can't honestly claim.
  if (!trend || trend.direction === "insufficient") return null;

  if (trend.direction === "baseline") {
    return (
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-[var(--text-muted)]">{label}</span>
        <span className="font-medium">{trend.current}<span className="text-[var(--text-faint)]">/100</span></span>
      </div>
    );
  }

  const d = DIRECTION[trend.direction] ?? DIRECTION.stable;
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className={`flex items-center gap-1.5 font-medium ${d.cls}`}>
        <d.Icon size={13} />
        {d.word}
        <span className="text-[var(--text-faint)]">
          {trend.delta > 0 ? `+${trend.delta}` : trend.delta}
        </span>
      </span>
    </div>
  );
};

const Chips = ({ items }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map((it) => (
      <span
        key={it.label}
        className="rounded-full bg-[var(--surface-subtle)] px-2.5 py-1 text-xs text-[var(--text-muted)]"
      >
        {it.label}
        <span className="ml-1 text-[var(--text-faint)]">{it.count}x</span>
      </span>
    ))}
  </div>
);

const PatternsCard = ({ patterns, isLoading }) => {
  if (isLoading) {
    return <div className="h-44 animate-pulse rounded-2xl bg-[var(--surface-subtle)]" />;
  }
  if (!patterns) return null;

  const { mood, stress, energy, emotions = [], themes = [], improvements = [], burnout, totalEntries } = patterns;

  // With almost no history there's nothing honest to say yet.
  if (totalEntries < 2) {
    return (
      <InsightCard icon={<Brain size={13} />} title="Patterns">
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          Keep journaling — after a few entries I'll start noticing your trends and
          recurring themes here.
        </p>
      </InsightCard>
    );
  }

  const showTrends = [mood, stress, energy].some((t) => t && t.direction !== "insufficient");

  return (
    <InsightCard icon={<Brain size={13} />} title="Patterns">
      {showTrends && (
        <div className="space-y-2">
          <TrendRow label="Mood" trend={mood} />
          <TrendRow label="Stress" trend={stress} />
          <TrendRow label="Energy" trend={energy} />
        </div>
      )}

      {improvements.length > 0 && (
        <div className="mt-3 rounded-lg bg-[var(--success)]/10 px-3 py-2.5">
          <p className="mb-1 flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--success)]">
            <PartyPopper size={12} /> Worth celebrating
          </p>
          <ul className="space-y-0.5">
            {improvements.map((s) => (
              <li key={s} className="text-sm leading-relaxed text-[var(--text)]">• {s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Supportive nudge — names observations, never labels the person. */}
      {burnout && !["insufficient", "none", "low"].includes(burnout.level) && (
        <div className="mt-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-3 py-2.5">
          <p className="mb-1 flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--accent)]">
            <HeartHandshake size={12} /> Gentle check-in
          </p>
          <p className="text-sm leading-relaxed">
            Lately {burnout.signals.join(", and ")}. That's a lot to carry — it might
            be worth protecting some rest, or talking it through with someone you trust.
          </p>
        </div>
      )}

      {emotions.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[0.7rem] uppercase tracking-wide text-[var(--text-faint)]">Recurring emotions</p>
          <Chips items={emotions} />
        </div>
      )}

      {themes.length > 0 && (
        <div className="mt-2.5">
          <p className="mb-1.5 text-[0.7rem] uppercase tracking-wide text-[var(--text-faint)]">Recurring topics</p>
          <Chips items={themes} />
        </div>
      )}
    </InsightCard>
  );
};

export default PatternsCard;
