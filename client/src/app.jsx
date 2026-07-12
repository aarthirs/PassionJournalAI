import { BrowserRouter , Routes , Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Toast from "./components/common/Toast";
import useJournal from "./hooks/useJournal";
function App(){
    const { toast } = useJournal();
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
   