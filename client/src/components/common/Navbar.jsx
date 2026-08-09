import { Brain, LogOut } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="mb-8 flex items-center justify-between rounded-xl border border-white/10 bg-[#111827] px-8 py-5 shadow-lg">
      <div className="flex items-center gap-3">
        <Brain size={32} className="text-violet-400" />
        <h1 className="text-2xl font-bold tracking-wide">Reflect AI</h1>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="h-9 w-9 rounded-full" />
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-300">
                {(user.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-tight">{user.name}</p>
              <p className="text-xs text-gray-400 leading-tight">{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
          title="Log out"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
