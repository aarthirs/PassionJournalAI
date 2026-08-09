import { useEffect } from "react";

/**
 * Mobile bottom sheet. On phones a panel sliding up from the bottom is the
 * native-feeling pattern (thumb-reachable, familiar), whereas a side drawer
 * fights the way people hold a device.
 *
 * Locks background scroll while open and closes on Escape.
 */
const BottomSheet = ({ open, onClose, title, children }) => {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-3xl border-t border-[var(--border)] bg-[var(--surface-panel)] shadow-2xl"
        style={{ animation: "sheet-up 220ms cubic-bezier(0.32,0.72,0,1)" }}
      >
        {/* Grab handle — signals the sheet is dismissible. */}
        <div className="flex justify-center pt-3 pb-1" onClick={onClose}>
          <span className="h-1.5 w-10 rounded-full bg-[var(--border-strong)]" />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
