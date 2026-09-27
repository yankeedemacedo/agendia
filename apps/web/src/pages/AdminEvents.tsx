import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { isPaged, type EventsResponse } from "../types";

export function AdminEvents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const organizerOnly = user?.papel === "organizer";
  const { data, isLoading } = useQuery({
    queryKey: ["admin-events", organizerOnly ? "mine" : "all"],
    queryFn: () =>
      api.get<EventsResponse>(
        organizerOnly ? "/api/events/mine" : "/api/events?page=1&limit=50",
      ),
  });

  const events = data ? (isPaged(data) ? data.data : data) : [];

  const remove = async (id: string, titulo: string) => {
    if (!confirm(`Excluir "${titulo}"?`)) return;
    await api.del(`/api/events/${id}`);
    void queryClient.invalidateQueries({ queryKey: ["admin-events"] });
  };

  const duplicate = async (id: string) => {
    await api.post(`/api/events/${id}/duplicar`);
    void queryClient.invalidateQueries({ queryKey: ["admin-events"] });
  };

  return (
    <main className="container">
      <div className="row-between">
        <h1>Eventos</h1>
        <Link to="/admin/eventos/novo" className="btn-primary btn-sm">
          + Criar evento
        </Link>
      </div>
      {isLoading && <p>Carregando…</p>}
      <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Data</th>
            <th>Vagas</th>
            <th>Inscritos</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev) => (
            <tr key={ev.id}>
              <td>{ev.titulo}</td>
              <td>
                {ev.data} {ev.horario}
              </td>
              <td>{ev.vagas}</td>
              <td>{ev.participantes.length}</td>
              <td>{ev.status || "publicado"}</td>
              <td className="actions">
                <Link to={`/admin/eventos/${ev.id}/presenca`}>Presença</Link>
                <Link to={`/admin/eventos/${ev.id}`}>Editar</Link>
                <button
                  className="link-primary"
                  onClick={() => void duplicate(ev.id)}
                >
                  Duplicar
                </button>
                <button
                  className="link-danger"
                  onClick={() => void remove(ev.id, ev.titulo)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </main>
  );
}
