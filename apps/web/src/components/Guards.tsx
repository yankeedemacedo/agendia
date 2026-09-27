import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { ReactNode } from "react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <main className="hero"><p>Carregando…</p></main>;
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <main className="hero"><p>Carregando…</p></main>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.papel !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function RequireOrganizer({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <main className="hero"><p>Carregando…</p></main>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.papel !== "admin" && user.papel !== "organizer") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
