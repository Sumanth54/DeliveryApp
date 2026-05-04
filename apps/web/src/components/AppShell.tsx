import { memo, Suspense, type ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCartState } from "../context/CartContext";

type AppShellProps = {
  fallback?: ReactNode;
  onOpenLogin: () => void;
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive ? "bg-brand-500 text-white" : "text-slate hover:bg-stone-100"
  }`;

function AppShellComponent({ fallback, onOpenLogin }: AppShellProps) {
  const { totalItems } = useCartState();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-stone-50 text-slate">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-600">
              Sagara local delivery
            </p>
            <h1 className="text-2xl font-black tracking-tight text-slate">Namma Basket</h1>
          </div>

          <nav className="flex flex-wrap gap-2">
            <NavLink className={navLinkClass} to="/">
              Home
            </NavLink>
            <NavLink className={navLinkClass} to="/cart">
              Cart ({totalItems})
            </NavLink>
            <NavLink className={navLinkClass} to="/orders">
              Orders
            </NavLink>
            <NavLink className={navLinkClass} to="/admin">
              Admin
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium">
                  {user.name} · {user.role}
                </div>
                <button
                  className="rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-slate"
                  onClick={logout}
                  type="button"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
                onClick={onOpenLogin}
                type="button"
              >
                Login with OTP
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Suspense fallback={fallback ?? null}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

export const AppShell = memo(AppShellComponent);
