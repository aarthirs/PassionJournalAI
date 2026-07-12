import { LoaderCircle } from "lucide-react";

const Loading = () => {
  return (
    <div className="flex h-52 items-center justify-center">

      <LoaderCircle

        size={36}

        className="animate-spin text-violet-600"

      />

    </div>
  );
};

export default Loading;