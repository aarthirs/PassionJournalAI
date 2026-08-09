import { Activity, Zap, Repeat, Gauge } from "lucide-react";
import InsightCard from "./InsightCard";
import ProgressRing from "./ProgressRing";
import MetricBar from "./MetricBar";

const TodaysProgress = ({ analysis, streak, consistency }) => {
  const a = analysis || {};
  // Streak ring is capped at a 30-day goal so the gauge stays meaningful.
  const streakPct = Math.min(100, Math.round((streak / 30) * 100));

  return (
    <InsightCard icon={<Activity size={13} />} title="Today's Progress">
      <div className="mb-4 flex justify-around">
        <ProgressRing value={a.score} label="Mood" color="var(--ring-mood)" />
        <ProgressRing value={a.depthScore} label="Depth" color="var(--ring-depth)" />
        <ProgressRing value={streakPct} label="Streak" color="var(--ring-streak)" />
      </div>

      <div className="space-y-3">
        <MetricBar
          icon={<Zap size={14} />}
          label="Daily Streak"
          value={streakPct}
          display={`${streak} ${streak === 1 ? "day" : "days"}`}
          color="var(--ring-streak)"
        />
        <MetricBar
          icon={<Repeat size={14} />}
          label="Consistency"
          value={consistency}
          display={`${consistency}%`}
          color="var(--ring-depth)"
        />
        <MetricBar
          icon={<Gauge size={14} />}
          label="Reflection Depth"
          value={a.depthScore}
          display={a.depth || "—"}
          color="var(--ring-mood)"
        />
      </div>
    </InsightCard>
  );
};

export default TodaysProgress;
