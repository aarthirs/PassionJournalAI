import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import useJournal from "../../hooks/useJournal";
import {
  getWeeklyTrend,
  getAverageScore,
  getHighestScore,
  getBestPassion,
  getTotalEntries
} from "../../utils/dashboardUtils";
const WeeklyTrend = ({title , duration}) => {
    const { history } = useJournal();

    const chartData = getWeeklyTrend(history);

    const average = getAverageScore(history);

    const highest = getHighestScore(history);

    const bestPassion = getBestPassion(history);

    const totalEntries = getTotalEntries(history);

    if (history.length === 0) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 p-10">

      <div className="mb-4 text-5xl">
        📈
      </div>

      <h2 className="mb-2 text-xl font-semibold">
        No Trend Available
      </h2>

      <p className="text-center text-gray-400">
        Start writing journals to visualize your passion journey.
      </p>

    </div>
  );
}

 return (
  <div className="flex flex-col justify-center item-center">
    <h2 className="mb-2 text-2xl font-semibold">
      {title}
    </h2>

    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={chartData}
          margin={{ top: 5, right: 10, left: -20, bottom: 0 }} // Adjust these values
        >
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="#9CA3AF"
            fontSize={12}
            tickMargin={5}
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={12}
          />
          <Tooltip contentStyle={{
            background:"#111827",
            borderRadius:"12px",
            border:"none",
            color:"#fff"
            }}/>
          <Line
            type="monotone"
            dataKey="score"
            stroke="#F97316"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>

    <p className="mt-2 text-center text-sm text-gray-400">
      {duration}
    </p>

    <div className="mt-6 grid grid-cols-3 gap-4">

    <div className="rounded-lg bg-[#111827] p-3">

        <p className="text-sm text-gray-400">
            Average
        </p>

        <h3 className="text-xl font-bold text-orange-400">
            {average}%
        </h3>

    </div>

    <div className="rounded-lg bg-[#111827] p-3">

        <p className="text-sm text-gray-400">
            Best Day
        </p>

        <h3 className="text-xl font-bold">
            {bestPassion}
        </h3>

    </div>

    <div className="rounded-lg bg-[#111827] p-3">

        <p className="text-sm text-gray-400">
            Highest
        </p>

        <h3 className="text-xl font-bold text-green-400">
            {highest}
        </h3>

    </div> 

</div>
  </div>
  
);
};

export default WeeklyTrend;

/*
ResponsiveContainer

↓

LineChart

↓

XAxis
YAxis
Tooltip
Line
*/ 