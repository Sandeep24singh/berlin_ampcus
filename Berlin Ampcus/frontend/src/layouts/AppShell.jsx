import { Link, NavLink, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export function AppShell() {
  const auth = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.16),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef6f4_100%)]">
      <header className="sticky top-0 z-10 border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-extrabold tracking-tight text-ink">
            Clean Stream
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
            <NavLink to="/" className="transition hover:text-ink">
              Feed
            </NavLink>
            {auth.isAuthenticated ? (
              <NavLink to="/create" className="transition hover:text-ink">
                Create post
              </NavLink>
            ) : null}
            {auth.isModerator ? (
              <NavLink to="/moderation" className="transition hover:text-ink">
                Moderation
              </NavLink>
            ) : null}
            {!auth.isAuthenticated ? (
              <NavLink to="/auth" className="rounded-full bg-ink px-4 py-2 text-white transition hover:bg-slate-800">
                Sign in
              </NavLink>
            ) : (
              <button type="button" onClick={auth.signOut} className="rounded-full border border-slate-300 px-4 py-2 text-slate-700">
                Sign out
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
