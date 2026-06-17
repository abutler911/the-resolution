import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function navClass({ isActive }: { isActive: boolean }): string {
  return [
    "px-3 py-2 rounded-md text-sm font-medium transition",
    isActive
      ? "bg-tension text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-display text-xl font-bold text-tension">
            The Resolution
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
            <NavLink to="/trainer" className={navClass}>
              Trainer
            </NavLink>
            <NavLink to="/lessons" className={navClass}>
              Lessons
            </NavLink>
            {user && (
              <NavLink to="/progress" className={navClass}>
                Progress
              </NavLink>
            )}
            {user ? (
              <button onClick={handleLogout} className="btn-ghost ml-2 text-sm">
                Sign out
              </button>
            ) : (
              <Link to="/login" className="btn-primary ml-2 text-sm">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
