import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Dashboard } from "../types";

function Card({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="card stat">
      <span className="stat-value">
        {value}
        {suffix}
      </span>
      <span className="muted">{label}</span>
    </div>
  );
}

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<Dashboard>("/api/admin/dashboard"),
  });

  if (isLoading) {
    return (
      <main className="container">
        <p>Carregando dashboard…</p>
      </main>
    );
  }
  if (!data) {
    return (
      <main className="container">
        <p>Sem dados.</p>
      </main>
    );
  }

  return (
    <main className="container">
      <h1>Dashboard</h1>
      <div className="grid stats">
        <Card label="Eventos" value={data.resumo.eventos} />
        <Card label="Inscritos" value={data.resumo.inscritos} />
        <Card label="Presentes" value={data.resumo.presentes} />
        <Card label="Ausentes (no-show)" value={data.resumo.ausentes} />
        <Card label="Ocupação" value={data.resumo.ocupacao} suffix="%" />
        <Card label="Taxa de presença" value={data.resumo.taxaPresenca} suffix="%" />
        <Card label="Na waitlist" value={data.resumo.waitlist} />
      </div>

      <h2>Top eventos</h2>
      <div className="grid">
        {data.top.map(({ event, stats }) => (
          <Link key={event.id} to={`/admin/eventos/${event.id}/presenca`} className="card">
            <h3>{event.titulo}</h3>
            <p className="muted">
              {stats.inscritos} inscritos · {stats.presentes} presentes ·{" "}
              {stats.ausentes} ausentes
            </p>
            <div className="bar">
              <div className="bar-fill" style={{ width: `${Math.min(100, stats.ocupacao)}%` }} />
            </div>
            <span className="muted">{stats.ocupacao}% ocupado</span>
          </Link>
        ))}
      </div>

      <h2>Todos os eventos</h2>
      <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Evento</th>
            <th>Ocupação</th>
            <th>Presença</th>
            <th>Waitlist</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.eventos.map(({ event, stats }) => (
            <tr key={event.id}>
              <td>{event.titulo}</td>
              <td>
                {stats.inscritos}/{stats.vagas} ({stats.ocupacao}%)
              </td>
              <td>
                {stats.presentes}/{stats.inscritos} ({stats.taxaPresenca}%)
              </td>
              <td>{stats.waitlist}</td>
              <td className="actions">
                <Link to={`/admin/eventos/${event.id}/presenca`}>Presença</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </main>
  );
}
