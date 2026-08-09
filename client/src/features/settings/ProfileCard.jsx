import { Flame, TrendingUp, BookOpen, Trophy } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useAnalytics from "../../hooks/useAnalytics";

const Stat = ({ icon, label, value }) => (
  <div className="rounded-xl bg-[var(--surface-subtle)] px-3 py-2.5 text-center">
    <div className="mb-1 flex justify-center text-[var(--accent)]">{icon}</div>
    <p className="text-lg font-bold leading-none">{value}</p>
    <p className="mt-1 text-[0.7rem] text-[var(--text-muted)]">{label}</p>
  </div>
);

const ProfileCard = () => {
  const { user } = useAuth();
  // Reuses the cached all-time analytics query — no extra endpoint needed.
  const { data } = useAnalytics("all");

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow)]">
      <div className="flex items-center gap-4">
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="h-16 w-16 rounded-full" />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--accent-soft)] text-xl font-bold text-[var(--accent)]">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">{user?.name}</h2>
          <p className="truncate text-sm text-[var(--text-muted)]">{user?.email}</p>
          <p className="mt-0.5 text-xs text-[var(--text-faint)]">Signed in with Google</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat icon={<Flame size={15} />} label="Day streak" value={data?.stats?.streak ?? 0} />
        <Stat icon={<TrendingUp size={15} />} label="Growth score" value={data?.stats?.growthScore ?? 0} />
        <Stat icon={<BookOpen size={15} />} label="Entries" value={data?.stats?.totalEntries ?? 0} />
        <Stat icon={<Trophy size={15} />} label="Milestones" value={data?.achievements?.length ?? 0} />
      </div>
    </section>
  );
};

export default ProfileCard;
