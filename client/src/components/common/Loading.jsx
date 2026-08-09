import { LoaderCircle } from "lucide-react";

const Loading = ({ size = 32 }) => (
  <div className="flex items-center justify-center py-10">
    <LoaderCircle size={size} className="animate-spin text-[var(--accent)]" />
  </div>
);

export default Loading;
