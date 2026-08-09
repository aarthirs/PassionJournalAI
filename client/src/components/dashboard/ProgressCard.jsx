import { Flame, BookOpen, Calendar1Icon } from "lucide-react";

import StatCard from "./StatCard";
import useJournal from "../../hooks/useJournal";
import { getCurrentStreak } from "../../utils/dashboardUtils";
const ProgressCards = () => {
    
    const {analysis,history}=useJournal();
    const streak = getCurrentStreak(history);
  const stats = [
  {
    title: "Passion Score",
    value: analysis?.score ?? "--",
    icon: <Flame size={22} />,
  },

  {
    title: "Current Streak",
    value: `${streak} ${
      streak === 1 ? "Day" : "Days"
    }`,
    icon: <BookOpen size={22} />,
  },

  {
    title: "Journal Entries",
    value: history.length,
    icon: <Calendar1Icon size={22} />,
  },
];

  return (
    <div>

      <h2 className="mb-6 text-2xl font-semibold">
        Today's Progress
      </h2>

      <div className="space-y-4">

      {
        stats.map((stat)=>(
            <StatCard
             key={stat.title}
             title={stat.title}
             value={stat.value}
             icon={stat.icon}
            />
        ))
      }

      </div>

    </div>
  );
};

export default ProgressCards;