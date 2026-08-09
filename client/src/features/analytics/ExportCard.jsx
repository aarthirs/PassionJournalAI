import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { downloadCsv } from "../../services/analyticsService";

const ExportCard = ({ range }) => {
  const [busy, setBusy] = useState(false);

  const handleCsv = async () => {
    setBusy(true);
    try { await downloadCsv(range); } finally { setBusy(false); }
  };

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-6 text-center print:hidden">
      <h3 className="font-semibold">Export Your Data</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-[var(--text-muted)]">
        Download your complete journal history, insights and analytics.
      </p>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button
          onClick={handleCsv}
          disabled={busy}
          className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {busy ? "Preparing…" : "Download CSV"}
        </button>

        {/* PDF via the browser's own print-to-PDF, styled by our print CSS. */}
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl border border-[var(--border-strong)] px-5 py-2.5 text-sm font-semibold transition hover:bg-[var(--surface-card)]"
        >
          <FileText size={16} />
          Save as PDF
        </button>
      </div>

      <p className="mt-3 text-xs text-[var(--text-faint)]">
        CSV opens in Excel or Sheets. "Save as PDF" uses your browser's print dialog.
      </p>
    </section>
  );
};

export default ExportCard;
