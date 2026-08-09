import { Plus, Calendar } from "lucide-react";

import DashboardLayout from "../layout/DashboardLayout";
import Card from "../components/common/Card";
import Toast from "../components/common/Toast";
import JournalInput from "../components/dashboard/JournalInput";
import ProgressCard from "../components/dashboard/ProgressCard";
import AIReflection from "../components/dashboard/AIReflection";
import WeeklyTrend from "../components/dashboard/WeeklyTrend";
import PreviousEntries from "../components/dashboard/PreviousEntries";
import useJournal from "../hooks/useJournal";
import Loading from "../components/common/Loading";

const Dashboard = () => {
  const { loading, toast, setToast, activeEntry, startNew } = useJournal();

  return (
    <DashboardLayout>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          {activeEntry ? (
            <ViewingEntry entry={activeEntry} onNew={startNew} />
          ) : (
            <JournalInput />
          )}
        </Card>

        <Card className="lg:col-span-4">
          <ProgressCard />
        </Card>

        <Card className="lg:col-span-8">
          {loading ? <Loading /> : <AIReflection />}
        </Card>

        <Card className="lg:col-span-4">
          <WeeklyTrend title="Weekly Trend" duration="Last 7 Days" />
        </Card>

        <Card className="lg:col-span-12">
          <PreviousEntries />
        </Card>
      </div>
    </DashboardLayout>
  );
};

// Read-only view of a past reflection selected from the sidebar.
const ViewingEntry = ({ entry, onNew }) => (
  <div>
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="truncate text-xl font-semibold">{entry.title}</h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--secondary)]">
          <Calendar size={14} />
          {new Date(entry.createdAt).toLocaleString([], {
            day: "numeric", month: "short", year: "numeric",
            hour: "numeric", minute: "2-digit",
          })}
        </p>
      </div>
      <button
        onClick={onNew}
        className="flex shrink-0 items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
      >
        <Plus size={16} /> New
      </button>
    </div>

    <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
      <p className="whitespace-pre-wrap leading-7 text-gray-300">{entry.journal}</p>
    </div>
  </div>
);

export default Dashboard;
