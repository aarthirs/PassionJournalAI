import DashboardLayout from "../layout/DashboardLayout";
import Card from "../components/common/Card";
import JournalInput from "../components/dashboard/JournalInput";
import ProgressCard from "../components/dashboard/ProgressCard";
import AIReflection from "../components/dashboard/AIReflection";
import WeeklyTrend from "../components/dashboard/WeeklyTrend";
import PreviousEntries from "../components/dashboard/PreviousEntries";
import useJournal from "../hooks/useJournal";
import Loading from "../components/common/Loading";

const Dashboard = () => {
  const { loading } = useJournal();

  return (
    <DashboardLayout>
      {/* Single column on mobile, 12-col grid from large screens up */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8">
          <JournalInput />
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

export default Dashboard;
