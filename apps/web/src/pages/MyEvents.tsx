import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import type { EventItem } from "../types";

export function MyEvents() {
  const { user } = useAuth();
  const ids = user?.eventos ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ["my-events", ids],
    queryFn: async () => {
      // Um evento deletado não pode derrubar a lista inteira
      const results = await Promise.allSettled(
        ids.map((id) => api.get<EventItem>(`/api/events/${id}`)),
      );
      return results
        .filter(
          (r): r is PromiseFulfilledResult<EventItem> => r.status === "fulfilled",
        )
        .map((r) => r.value);
    },
    enabled: ids.length > 0,
  });

  return (
    <main className="container">
      <h1>Minhas vagas</h1>
      {isLoading && <p>Carregando…</p>}
      {!isLoading && ids.length === 0 && (
        <p className="empty">
          Você ainda não se inscreveu em nada.{" "}
          <Link to="/">Explorar eventos</Link>
        </p>
      )}
      <div className="grid">
        {(data ?? []).map((ev) => (
          <Link key={ev.id} to={`/meus-eventos/${ev.id}/ingresso`} className="card">
            <h3>{ev.titulo}</h3>
            <p className="muted">
              {ev.data} · {ev.horario} · {ev.local}
            </p>
            <p className="link-primary">Ver ingresso →</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
