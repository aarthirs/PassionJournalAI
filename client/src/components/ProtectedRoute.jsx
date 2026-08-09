import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Loading from "./common/Loading";

// Wraps private routes. While we're checking the session, show a loader; if
// there's no user, bounce to /login; otherwise render the protected content.
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--bg)]">
        <Loading />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
