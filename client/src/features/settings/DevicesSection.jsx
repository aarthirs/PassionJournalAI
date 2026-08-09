import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MonitorSmartphone, LogOut, Loader2 } from "lucide-react";
import { Section } from "./controls";
import { fetchDevices, revokeDevice } from "../../services/settingsService";

const fmt = (d) =>
  new Date(d).toLocaleString([], { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

const DevicesSection = () => {
  const qc = useQueryClient();
  const { data: devices = [], isLoading } = useQuery({ queryKey: ["devices"], queryFn: fetchDevices });

  const revoke = useMutation({
    mutationFn: revokeDevice,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["devices"] }),
  });

  return (
    <Section
      icon={<MonitorSmartphone size={16} className="text-[var(--accent)]" />}
      title="Manage Devices"
      description="Everywhere you're currently signed in. Revoking ends that session immediately."
    >
      {isLoading ? (
        <div className="space-y-2">
          {[0, 1].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-[var(--surface-subtle)]" />)}
        </div>
      ) : devices.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No active sessions found.</p>
      ) : (
        <ul className="space-y-2">
          {devices.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-3.5 py-3"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  {d.browser} on {d.os}
                  {d.current && (
                    <span className="rounded-full bg-[var(--success)]/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--success)]">
                      this device
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-faint)]">Signed in {fmt(d.signedInAt)}</p>
              </div>

              {!d.current && (
                <button
                  onClick={() => revoke.mutate(d.id)}
                  disabled={revoke.isPending}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--border-strong)] px-2.5 py-1.5 text-xs font-medium transition hover:bg-[var(--surface-subtle)] disabled:opacity-50"
                >
                  {revoke.isPending && revoke.variables === d.id
                    ? <Loader2 size={13} className="animate-spin" />
                    : <LogOut size={13} />}
                  Revoke
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
};

export default DevicesSection;
