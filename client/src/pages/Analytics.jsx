import { useState } from "react";
import { BookOpen, Repeat, TrendingUp, Smile, Sun, Moon } from "lucide-react";

import AppShell, { NavButton } from "../layout/AppShell";
import useAnalytics from "../hooks/useAnalytics";
import useTheme from "../hooks/useTheme";
import StatCard from "../features/analytics/StatCard";
import GrowthScoreCard from "../features/analytics/GrowthScoreCard";
import KeyInsightsCard from "../features/analytics/KeyInsightsCard";
import ConsistencyCalendar from "../features/analytics/ConsistencyCalendar";
import EmotionDistribution from "../features/analytics/EmotionDistribution";
import TrendStatCard from "../features/analytics/TrendStatCard";
import Milestones from "../features/analytics/Milestones";
import WordCloud from "../features/analytics/WordCloud";
import ExportCard from "../features/analytics/ExportCard";

const RANGES = [
  { key: "6m", label: "6M" },
  { key: "1y", label: "1Y" },
  { key: "all", label: "All" },
];

const Analytics = () => {
  const [range, setRange] = useState("1y");
  const { data, isLoading, isError, error, refetch } = useAnalytics(range);
  const { resolved, toggle } = useTheme();

  const header = ({ openNav }) => (
    <header className="flex shrink-0 items-center gap-2 border-b border-[var(--border)] px-4 py-3 lg:px-6 xl:px-8 print:hidden">
      <NavButton onClick={openNav} />
      <h1 className="min-w-0 flex-1 truncate text-lg font-semibold">Trend Analysis</h1>

      <div className="flex items-center gap-1 rounded-xl bg-[var(--surface-subtle)] p-1">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
              range === r.key
                ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <button
        onClick={toggle}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--surface-subtle)]"
        title={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
      >
        {resolved === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    </header>
  );

  return (
    <AppShell header={header}>
      {/*
       * Content fills the available width (capped at 1600px so text lines stay
       * readable on ultra-wide displays) rather than sitting in a narrow centred
       * column with dead space either side.
       */}
      <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-6 xl:px-8">
        <div className="mx-auto w-full max-w-[1600px] space-y-4">
          {isLoading && <SkeletonPage />}

          {isError && (
            <div className="rounded-xl bg-[var(--danger)]/10 px-4 py-3.5 text-sm text-[var(--danger)]">
              <p className="font-medium">Couldn't load your analytics.</p>
              <p className="mt-1 text-xs opacity-90">
                {error?.response?.status ? `HTTP ${error.response.status}: ` : ""}
                {error?.response?.data?.detail || error?.response?.data?.error || error?.message || "Unknown error"}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-2.5 rounded-lg border border-[var(--danger)]/40 px-3 py-2 text-xs font-medium transition hover:bg-[var(--danger)]/10"
              >
                Try again
              </button>
            </div>
          )}

          {data && !data.hasData && (
            <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center">
              <BookOpen size={32} className="mx-auto mb-4 text-[var(--text-faint)]" />
              <h2 className="mb-1 text-lg font-semibold">Nothing to analyse yet</h2>
              <p className="text-sm text-[var(--text-muted)]">
                Write a few reflections and your trends will appear here.
              </p>
            </div>
          )}

          {data?.hasData && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard icon={<BookOpen size={17} />} label="Total Entries"
                  value={data.stats.totalEntries}
                  sub={range === "all" ? "all time" : range === "1y" ? "last 12 months" : "last 6 months"} />
                <StatCard icon={<Repeat size={17} />} label="Consistency"
                  value={`${data.stats.consistency}%`} sub="journaling frequency" />
                <StatCard icon={<TrendingUp size={17} />} label="Growth Score"
                  value={data.stats.growthScore}
                  deltaLabel={data.stats.growthDelta > 0 ? `↑${data.stats.growthDelta}` : undefined}
                  sub="out of 100" />
                <StatCard icon={<Smile size={17} />} label="Avg Mood"
                  value={data.stats.avgMood} suffix="/ 10" sub={`${data.stats.activeDays} active days`} />
              </div>

              {/* Growth (wide) + insights, then trends fill the remaining columns. */}
              <div className="grid gap-4 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <GrowthScoreCard stats={data.stats} growth={data.growth} series={data.growthSeries} />
                </div>
                <KeyInsightsCard insights={data.keyInsights} />
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <ConsistencyCalendar initial={data.calendar} />
                </div>
                <EmotionDistribution emotions={data.emotions} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <TrendStatCard title="Mood Trend" trend={data.mood} />
                <TrendStatCard title="Stress Trend" trend={data.stress} invert />
                <TrendStatCard title="Energy Trend" trend={data.energy} />
              </div>

              {data.words?.length > 0 && <WordCloud words={data.words} />}

              <Milestones achievements={data.achievements} locked={data.lockedAchievements} />

              <ExportCard range={range} />

              <p className="pb-2 text-center text-xs text-[var(--text-faint)]">
                Reflect AI offers supportive reflection and is not a substitute for a licensed
                mental-health professional.
              </p>
            </>
          )}
        </div>
      </main>
    </AppShell>
  );
};

const SkeletonPage = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-[var(--surface-subtle)]" />
      ))}
    </div>
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="h-80 animate-pulse rounded-2xl bg-[var(--surface-subtle)] xl:col-span-2" />
      <div className="h-80 animate-pulse rounded-2xl bg-[var(--surface-subtle)]" />
    </div>
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="h-72 animate-pulse rounded-2xl bg-[var(--surface-subtle)] xl:col-span-2" />
      <div className="h-72 animate-pulse rounded-2xl bg-[var(--surface-subtle)]" />
    </div>
  </div>
);

export default Analytics;
