import Navbar from "../components/common/Navbar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[var(--bg)]">

      <Navbar />

      <main
        className="
          max-w-7xl
          mx-auto
          px-6
          py-8
          
        "
      >
        {children}
      </main>
        
    </div>
  );
};

export default DashboardLayout;