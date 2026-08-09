import { Sparkles } from "lucide-react";
import Card from "./InsightCard";

const Chip = ({ label, value }) => (
  <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-2 py-2 text-center">
    <p className="text-[0.7rem] uppercase tracking-wide text-[var(--text-faint)]">{label}</p>
    <p className="mt-0.5 truncate text-sm font-medium">{value || "—"}</p>
  </div>
);

const TodaysReflection = ({ analysis }) => {
  const a = analysis || {};
  const hasContent = a.reflection || a.mood || a.emotion;

  return (
    <Card icon={<Sparkles size={13} />} title="Today's Reflection">
      {hasContent ? (
        <>
          {a.reflection && (
            <p className="text-sm leading-relaxed text-[var(--text)]">{a.reflection}</p>
          )}

          <div className="mt-3 flex gap-2">
            <Chip label="Mood" value={a.mood} />
            <Chip label="Emotion" value={a.emotion} />
            <Chip label="Depth" value={a.depth} />
          </div>

          {a.quote && (
            <blockquote className="mt-3 rounded-r-lg border-l-2 border-[var(--accent)] bg-[var(--surface-subtle)] px-3 py-2.5 text-sm italic leading-relaxed text-[var(--text-muted)]">
              "{a.quote}"
            </blockquote>
          )}

          {a.goal && (
            <div className="mt-3 rounded-lg bg-[var(--accent-soft)] px-3 py-2.5">
              <p className="text-[0.7rem] uppercase tracking-wide text-[var(--accent)]">Next step</p>
              <p className="mt-0.5 text-sm leading-relaxed">{a.goal}</p>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          Write your first reflection and your insights will appear here.
        </p>
      )}
    </Card>
  );
};

export default TodaysReflection;
