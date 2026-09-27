import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { EventItem } from "../types";

const EMPTY = {
  titulo: "",
  descricao: "",
  data: "",
  horario: "",
  local: "",
  vagas: "50",
  acesso: "Público",
  categoria: "Geral",
  tags: "",
  status: "publicado",
  capaUrl: "",
  inicio: "",
  fim: "",
};

export function AdminEventForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loaded, setLoaded] = useState(!editing);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [recorrencia, setRecorrencia] = useState({ aCada: "semana", vezes: "2" });
  const [recMsg, setRecMsg] = useState("");

  const { data: existing } = useQuery({
    queryKey: ["admin-event", id],
    queryFn: () => api.get<EventItem>(`/api/events/${id}`),
    enabled: editing,
  });

  useEffect(() => {
    if (!existing) return;
    setForm({
      titulo: existing.titulo,
      descricao: existing.descricao,
      data: existing.data,
      horario: existing.horario,
      local: existing.local,
      vagas: String(existing.vagas),
      acesso: existing.acesso,
      categoria: existing.categoria || "Geral",
      tags: (existing.tags ?? []).join(", "),
      status: existing.status || "publicado",
      capaUrl: existing.capaUrl || "",
      inicio: existing.inicio?.slice(0, 16) ?? "",
      fim: existing.fim?.slice(0, 16) ?? "",
    });
    setLoaded(true);
  }, [existing]);

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      ...form,
      vagas: Number(form.vagas),
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      inicio: form.inicio ? new Date(form.inicio).toISOString() : undefined,
      fim: form.fim ? new Date(form.fim).toISOString() : undefined,
    };
    try {
      if (editing) await api.patch(`/api/events/${id}`, payload);
      else await api.post("/api/events", payload);
      navigate("/admin/eventos");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <main className="container"><p>Carregando…</p></main>;

  return (
    <main className="container narrow">
      <h1>{editing ? "Editar evento" : "Criar evento"}</h1>
      {error && <p className="alert-error">{error}</p>}
      <form className="form" onSubmit={submit}>
        <label>Título<input className="input" required value={form.titulo} onChange={(e) => set("titulo", e.target.value)} /></label>
        <label>Descrição<textarea className="input" required value={form.descricao} onChange={(e) => set("descricao", e.target.value)} /></label>
        <div className="row">
          <label>Data (DD-MM-YYYY)<input className="input" required placeholder="25-12-2026" value={form.data} onChange={(e) => set("data", e.target.value)} /></label>
          <label>Horário (HH:mm)<input className="input" required placeholder="19:00" value={form.horario} onChange={(e) => set("horario", e.target.value)} /></label>
        </div>
        <label>Local<input className="input" required value={form.local} onChange={(e) => set("local", e.target.value)} /></label>
        <div className="row">
          <label>Vagas<input className="input" type="number" min={0} required value={form.vagas} onChange={(e) => set("vagas", e.target.value)} /></label>
          <label>Acesso
            <select className="input" value={form.acesso} onChange={(e) => set("acesso", e.target.value)}>
              <option>Público</option><option>Privado</option><option>Restrito</option>
            </select>
          </label>
          <label>Status
            <select className="input" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="rascunho">Rascunho</option><option value="publicado">Publicado</option><option value="encerrado">Encerrado</option>
            </select>
          </label>
        </div>
        <div className="row">
          <label>Categoria<input className="input" value={form.categoria} onChange={(e) => set("categoria", e.target.value)} /></label>
          <label>Tags (vírgula)<input className="input" value={form.tags} onChange={(e) => set("tags", e.target.value)} /></label>
        </div>
        <label>Capa (URL)<input className="input" value={form.capaUrl} onChange={(e) => set("capaUrl", e.target.value)} /></label>
        <div className="row">
          <label>Início<input className="input" type="datetime-local" value={form.inicio} onChange={(e) => set("inicio", e.target.value)} /></label>
          <label>Fim<input className="input" type="datetime-local" value={form.fim} onChange={(e) => set("fim", e.target.value)} /></label>
        </div>
        <button className="btn-primary" disabled={saving}>
          {saving ? "Salvando…" : editing ? "Salvar" : "Publicar"}
        </button>
      </form>

      {editing && (
        <section className="card" style={{ marginTop: 24 }}>
          <h3>Recorrência</h3>
          <p className="muted">
            Cria cópias em rascunho deslocando a data de início.
          </p>
          {recMsg && <p className="alert-success">{recMsg}</p>}
          <form
            className="filters"
            onSubmit={async (e) => {
              e.preventDefault();
              setRecMsg("");
              try {
                const res = await api.post<EventItem[]>(
                  `/api/events/${id}/recorrencia`,
                  {
                    aCada: recorrencia.aCada,
                    vezes: Number(recorrencia.vezes),
                  },
                );
                setRecMsg(`${res.length} cópia(s) criada(s) em rascunho.`);
              } catch (err) {
                setRecMsg(`Erro: ${(err as Error).message}`);
              }
            }}
          >
            <select
              className="input"
              value={recorrencia.aCada}
              onChange={(e) =>
                setRecorrencia({ ...recorrencia, aCada: e.target.value })
              }
            >
              <option value="semana">Semanal</option>
              <option value="mes">Mensal</option>
            </select>
            <input
              className="input"
              type="number"
              min={1}
              max={12}
              value={recorrencia.vezes}
              onChange={(e) =>
                setRecorrencia({ ...recorrencia, vezes: e.target.value })
              }
            />
            <button className="btn-primary" type="submit">
              Gerar cópias
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
