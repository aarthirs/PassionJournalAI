import { useEffect } from "react";

const Toast = ({ message, type, onClose }) => {

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(onClose, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`
        fixed top-5 right-5 z-[9999]
        rounded-lg px-5 py-3 text-white shadow-xl
        ${type === "success" ? "bg-green-600" : "bg-red-600"}
      `}
    >
      {message}
    </div>
  );
};

export default Toast;