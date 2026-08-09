import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Brain } from "lucide-react";
import useAuth from "../hooks/useAuth";

const Login = () => {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const error = params.get("error");

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--bg)] px-6 text-[var(--text)]">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-8 text-center shadow-xl">
        <div className="mb-6 flex items-center justify-center gap-3">
          <Brain size={32} className="text-[var(--accent)]" />
          <h1 className="text-2xl font-bold tracking-wide">Reflect AI</h1>
        </div>
        <h2 className="mb-6 text-xl font-semibold">Welcome back</h2>

        {error && (
          <p className="mb-4 rounded-lg bg-red-600/20 px-4 py-2 text-sm text-red-300">
            Sign-in failed. Please try again.
          </p>
        )}

        <button
          onClick={login}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white px-4 py-3 font-medium text-gray-800 transition hover:bg-gray-100"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt=""
            className="h-5 w-5"
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
