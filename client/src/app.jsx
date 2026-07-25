import Dashboard from "./pages/Dashboard";
import Toast from "./components/common/Toast";
import useJournal from "./hooks/useJournal";

// NOTE: Router (Welcome / Login / protected routes) is introduced in Phase 5.
function App() {
  const { toast, setToast } = useJournal();

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />
      <Dashboard />
    </>
  );
}

export default App;
