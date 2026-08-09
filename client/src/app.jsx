import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import ProtectedRoute from "./components/ProtectedRoute";
import Loading from "./components/common/Loading";

/*
 * Code splitting.
 *
 * Analytics pulls in Recharts (the single biggest dependency) and Settings is a
 * large form tree — neither is needed for the main journaling flow. Lazily
 * loading them keeps the initial bundle to what's required to start a
 * conversation; the chunks download the first time you visit those routes.
 */
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));

const RouteFallback = () => (
  <div className="grid min-h-screen place-items-center bg-[var(--bg)]">
    <Loading />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
