import Card from "../common/Card";

const ReflectionItem = ({ label, value, icon }) => {
  return (
    <Card className="flex items-center gap-4">

      {/* Icon */}

      <div
        className="
        flex
        h-8
        w-10
        items-center
        justify-center
        rounded-xl
        bg-orange-500/15
        text-orange-400
        "
      >
        {icon}
      </div>

      {/* Content */}

      <div>

        <p className="text-sm text-gray-400">
          {label}
        </p>

        <h3 className="text-lg font-semibold">
          {value}
        </h3>

      </div>

    </Card>
  );
};

export default ReflectionItem;