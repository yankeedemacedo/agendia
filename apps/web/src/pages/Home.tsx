import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { isPaged, type EventItem, type EventsResponse } from "../types";
import { Footer } from "../components/Footer";

export function vagasRestantes(ev: EventItem) {
  const total = ev.vagas ?? 0;
  const ocupadas = ev.participantes?.length ?? 0;
  return Math.max(0, total - ocupadas);
}

interface Stats {
  eventos: number;
  inscritos: number;
  vagasLivres: number;
  categorias: number;
}

export function Home() {
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [page, setPage] = useState(1);

  const { data: stats } = useQuery({
    queryKey: ["public-stats"],
    queryFn: () => api.get<Stats>("/api/events/stats"),
  });

  const { data: categorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => api.get<string[]>("/api/events/categorias"),
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["events", appliedSearch, categoria, page],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: "12",
        status: "publicado",
      });
      if (appliedSearch) params.set("search", appliedSearch);
      if (categoria) params.set("categoria", categoria);
      return api.get<EventsResponse>(`/api/events?${params}`);
    },
  });

  const events = data ? (isPaged(data) ? data.data : data) : [];
  const totalPages = data && isPaged(data) ? data.totalPages : 1;

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  };

  return (
    <>
      <main>
        <section className="hero">
          <p className="kicker">Agendia! — Edição 2026</p>
          <h1>
            Encontre.
            <br />
            Inscreva-se.
            <br />
            <span className="hl">Viva.</span>
          </h1>
          <p className="lede">
            O catálogo de eventos da sua cena. Inscrição em 1-clique,
            ingresso com QR e certificado.
          </p>
          <div className="hero-cta">
            <a className="btn-primary" href="#catalogo">
              Explorar eventos
            </a>
            <Link className="btn-ghost" to="/cadastro">
              Criar conta
            </Link>
          </div>
          <dl className="stats-row">
            <div>
              <dt>Eventos</dt>
              <dd>+{stats?.eventos ?? "…"}</dd>
            </div>
            <div>
              <dt>Inscritos</dt>
              <dd>+{stats?.inscritos ?? "…"}</dd>
            </div>
            <div>
              <dt>Vagas livres</dt>
              <dd>+{stats?.vagasLivres ?? "…"}</dd>
            </div>
          </dl>
        </section>

        <section id="catalogo" className="container">
          <h2 className="section-title">
            Find <span>your event.</span>
          </h2>

          <form className="filters" onSubmit={buscar}>
            <input
              className="input"
              placeholder="Buscar evento…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="input"
              value={categoria}
              onChange={(e) => {
                setCategoria(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todas as categorias</option>
              {(categorias ?? []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button className="btn-primary" type="submit">
              Buscar
            </button>
          </form>

          {isLoading && <p>Carregando eventos…</p>}
          {isError && <p className="alert-error">Não foi possível carregar.</p>}
          {!isLoading && events.length === 0 && (
            <p className="empty">Nenhum evento encontrado.</p>
          )}

          <div className="grid">
            {events.map((ev, i) => (
              <Link key={ev.id} to={`/eventos/${ev.id}`} className="card">
                <span className="card-index">
                  Evento {String((page - 1) * 12 + i + 1).padStart(2, "0")}
                </span>
                <span className="badge">{ev.categoria || "Geral"}</span>
                <h3>{ev.titulo}</h3>
                <p className="muted">
                  {ev.data} · {ev.horario} · {ev.local}
                </p>
                <p className="card-foot">
                  {vagasRestantes(ev)} de {ev.vagas} vagas livres →
                </p>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn-ghost"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Anterior
              </button>
              <span>
                Página {page} de {totalPages}
              </span>
              <button
                className="btn-ghost"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima →
              </button>
            </div>
          )}
        </section>

        <section className="manifesto">
          <p className="kicker">Manifesto</p>
          <h2>
            Accept
            <br />
            new challenges.
          </h2>
          <p>
            Cada evento é uma porta. A gente cuida da fila, do ingresso e do
            certificado — você cuida de aparecer.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
