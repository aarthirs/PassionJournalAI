import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Brain } from "lucide-react";
import useAuth from "../hooks/useAuth";

const Welcome = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Already signed in? Skip straight to the dashboard.
  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--bg)] px-6 text-[var(--text)]">
      <div className="max-w-xl text-center">
        <div className="mb-6 flex items-center justify-center gap-3">
          <Brain size={40} className="text-[var(--accent)]" />
          <h1 className="text-3xl font-bold tracking-wide">Reflect AI</h1>
        </div>
        <h2 className="mb-4 text-4xl font-semibold leading-tight">
          Your AI companion for reflection & growth
        </h2>
        <p className="mb-8 text-lg text-[var(--text-muted)]">
          Journal your thoughts, track your emotional trends, and get supportive,
          personalized reflections that grow with you over time.
        </p>
        <Link
          to="/login"
          className="inline-block rounded-xl bg-[var(--accent)] px-8 py-3 font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-hover)]"
        >
          Get Started
        </Link>
        <p className="mt-6 text-xs text-[var(--text-muted)]">
          Reflect AI offers supportive guidance and is not a substitute for a
          licensed mental-health professional.
        </p>
      </div>
    </div>
  );
};

export default Welcome;
