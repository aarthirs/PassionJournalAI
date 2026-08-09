import {
  Brain,
  Heart,
  Smile,
  Sparkles,
  Target,
} from "lucide-react";

import ReflectionItem from "./ReflectionItem";

import useJournal from "../../hooks/useJournal";
import Loading from "../common/Loading";
const AIReflection = () => {
    const { analysis } = useJournal();
  return (
    
    <div>

      <h2 className="mb-6 text-2xl font-semibold">
        Today's Reflection
      </h2>

      <div className="space-y-2 grid grid-cols-1 gap-4 md:grid-cols-3">

        <ReflectionItem
          label="Main Passion"
          value={analysis.passion}
          icon={<Heart size={22} />}
        />

        <ReflectionItem
          label="Mood"
          value={analysis.mood}
          icon={<Smile size={22} />}
        />

        <ReflectionItem
          label="Passion Score"
          value={analysis.score}
          icon={<Sparkles size={22} />}
        />

      </div>

     {/* Reflection + Goal */}

<div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">

  {/* Reflection */}

  <div>
    <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
      <Brain size={20} />
      Reflection
    </h3>

    <div className="rounded-xl border border-white/10 bg-[#111827] p-4 min-h-[140px]">
      <p className="leading-7 text-gray-300">
        {analysis.reflection}
      </p>
    </div>
  </div>

  {/* Goal */}

  <div>
    <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
      <Target size={20} />
      Tomorrow's Goal
    </h3>

    <div className="rounded-xl border border-white/10 bg-[#111827] p-4 min-h-[140px]">
      <p className="leading-7 text-gray-300">
        {analysis.goal}
      </p>
    </div>
  </div>

</div>

    </div>
  );

};

export default AIReflection;