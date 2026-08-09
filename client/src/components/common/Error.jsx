import { AlertCircle } from "lucide-react";

const Error = ({ message }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-[var(--danger)]/10 px-3 py-2.5 text-[var(--danger)]">
      <AlertCircle size={17} className="shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default Error;
