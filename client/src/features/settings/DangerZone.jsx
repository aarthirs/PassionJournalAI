import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Section } from "./controls";
import { deleteAccount } from "../../services/settingsService";
import useAuth from "../../hooks/useAuth";

const DangerZone = () => {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { logout } = useAuth();

  const handleDelete = async () => {
    setBusy(true);
    setError("");
    try {
      await deleteAccount();
      // Account is gone — clear local auth state and return to the welcome page.
      await logout();
    } catch (e) {
      setError(e?.response?.data?.error || "Couldn't delete your account. Please try again.");
      setBusy(false);
    }
  };

  return (
    <Section
      danger
      icon={<AlertTriangle size={16} />}
      title="Delete Account"
      description="Permanently removes your journals, conversations, insights and achievements. This cannot be undone."
    >
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl border border-[var(--danger)]/50 px-4 py-2 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger)]/10"
        >
          Delete my account
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm">
            Consider exporting your data first — this deletes everything and cannot be reversed.
            Type <code className="rounded bg-[var(--surface-subtle)] px-1.5 py-0.5 font-mono text-xs">DELETE</code> to confirm.
          </p>

          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="DELETE"
            className="w-full max-w-xs rounded-xl border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2 text-sm outline-none focus:border-[var(--danger)]"
          />

          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDelete}
              disabled={typed !== "DELETE" || busy}
              className="flex items-center gap-2 rounded-xl bg-[var(--danger)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy && <Loader2 size={15} className="animate-spin" />}
              {busy ? "Deleting…" : "Permanently delete"}
            </button>
            <button
              onClick={() => { setOpen(false); setTyped(""); setError(""); }}
              disabled={busy}
              className="rounded-xl border border-[var(--border-strong)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--surface-subtle)]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Section>
  );
};

export default DangerZone;
