import { AlertCircle } from "lucide-react";

const Error = ({ message }) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl p-4 text-red-700">
      <AlertCircle size={20} />

      <p className="text-sm font-medium">
        {message}
      </p>
    </div>
  );
};

export default Error;