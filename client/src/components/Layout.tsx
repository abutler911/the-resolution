import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  BookIcon,
  ChartIcon,
  EarIcon,
  HomeIcon,
  TrainerIcon,
} from "./icons";

type NavItem = {
  to: string;
  label: string;
  icon: (p: { className?: string }) => JSX.Element;
  end?: boolean;
  authOnly?: boolean;
};

const NAV: NavItem[] = [
  { to: "/", label: "Home", icon: HomeIcon, end: true },
  { to: "/trainer", label: "Trainer", icon: TrainerIcon },
  { to: "/ear-training", label: "Ear", icon: EarIcon },
  { to: "/lessons", label: "Lessons", icon: BookIcon },
  { to: "/progress", label: "Progress", icon: ChartIcon, authOnly: true },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV.filter((i) => !i.authOnly || user);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-900/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="group flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white shadow-glow">
              ♪
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              The <span className="gradient-text animate-gradient">Resolution</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {user ? (
            <button onClick={handleLogout} className="btn-ghost text-sm">
              Sign out
            </button>
          ) : (
            <Link to="/login" className="btn-primary text-sm">
              Sign in
            </Link>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 md:pb-12 md:pt-10">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-800/80 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition ${
                    isActive ? "text-white" : "text-zinc-500"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={
                        isActive
                          ? "text-tension drop-shadow-[0_0_8px_rgba(99,102,241,0.7)]"
                          : ""
                      }
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
