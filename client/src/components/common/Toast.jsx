import { useEffect } from "react";

const Toast = ({ message, type = "success", onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <div
      role="status"
      className={`fixed bottom-5 right-5 z-[9999] max-w-sm rounded-xl px-4 py-3 text-sm font-medium text-white shadow-2xl ${
        type === "success" ? "bg-[var(--success)]" : "bg-[var(--danger)]"
      }`}
    >
      {message}
    </div>
  );
};

export default Toast;
