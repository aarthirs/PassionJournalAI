import { Lightbulb } from "lucide-react";

const DOTS = ["bg-[var(--ring-streak)]", "bg-[var(--accent)]", "bg-[var(--success)]", "bg-[var(--ring-depth)]"];

const KeyInsightsCard = ({ insights = [] }) => (
  <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow)]">
    <h3 className="mb-3 flex items-center gap-2 font-semibold">
      <Lightbulb size={15} className="text-[var(--ring-streak)]" />
      Key Insights
    </h3>

    {insights.length === 0 ? (
      <p className="text-sm leading-relaxed text-[var(--text-muted)]">
        Keep journaling — patterns worth pointing out will show up here once
        there's enough history.
      </p>
    ) : (
      <ul className="space-y-2.5">
        {insights.map((text, i) => (
          <li key={text} className="flex gap-2.5 text-sm leading-relaxed">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${DOTS[i % DOTS.length]}`} />
            {text}
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default KeyInsightsCard;
