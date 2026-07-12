import Card from "../common/Card";

const StatCard = ({ title, value, icon }) => {
  return (
    <Card className="flex items-center gap-4 hover:border-orange-400 transition-all duration-300 cursor-pointer">
      {/* Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
        {icon}
      </div>

      {/* Content */}
      <div className="flex flex-col">
        <p className="text-sm text-gray-400">{title}</p>

        <h2 className="text-2xl font-bold text-white">{value}</h2>
      </div>
    </Card>
  );
};

export default StatCard;