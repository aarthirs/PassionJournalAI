import { Trophy, Flame, Repeat, TrendingUp, Compass, BookOpen, Award, Lock } from "lucide-react";

// Icon per achievement key, with a sensible default.
const ICONS = {
  first_entry: BookOpen, entries_10: BookOpen, entries_50: BookOpen, entries_100: Award,
  streak_7: Flame, streak_30: Flame, consistency_90: Repeat,
  growth_75: TrendingUp, self_discovery: Compass, deep_thinker: Trophy,
};

const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const Milestones = ({ achievements = [], locked = [] }) => (
  <section>
    <h3 className="mb-3 font-semibold">Personal Milestones</h3>

    {achievements.length === 0 && locked.length === 0 ? (
      <p className="text-sm text-[var(--text-muted)]">Milestones will appear as you journal.</p>
    ) : (
      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        {achievements.map((a) => {
          const Icon = ICONS[a.key] || Trophy;
          return (
            <div key={a.key} className="flex gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow)]">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent)] text-[var(--accent-fg)]">
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-medium">{a.title}</p>
                <p className="text-xs text-[var(--text-faint)]">Achieved {fmt(a.achievedAt)}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">{a.description}</p>
              </div>
            </div>
          );
        })}

        {/* Showing what's next is more motivating than hiding it. */}
        {locked.map((a) => (
          <div key={a.key} className="flex gap-3 rounded-2xl border border-dashed border-[var(--border)] p-4 opacity-70">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-subtle)] text-[var(--text-faint)]">
              <Lock size={16} />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-[var(--text-muted)]">{a.title}</p>
              <p className="text-xs text-[var(--text-faint)]">Not yet unlocked</p>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-faint)]">{a.description}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

export default Milestones;
