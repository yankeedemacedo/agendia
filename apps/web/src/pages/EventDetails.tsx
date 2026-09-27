import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import type { EventItem } from "../types";
import { vagasRestantes } from "./Home";

export function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [msg, setMsg] = useState<{
    ok: boolean;
    text: string;
    waitlist?: boolean;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: ev, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => api.get<EventItem>(`/api/events/${id}`),
  });

  const { data: posicao, refetch: refetchPosicao } = useQuery({
    queryKey: ["waitlist-pos", id],
    queryFn: () =>
      api.get<{ eventId: string; position: number }>(
        `/api/participants/${id}/waitlist/posicao`,
      ),
    enabled: Boolean(user && ev && !user.eventos.includes(ev.id)),
    retry: false,
  });

  if (isLoading) return <main className="container"><p>Carregando…</p></main>;
  if (!ev) return <main className="container"><p>Evento não encontrado.</p></main>;

  const inscrito = user?.eventos.includes(ev.id) ?? false;
  const livres = vagasRestantes(ev);

  const inscrever = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/eventos/${ev.id}` } });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const res = await api.post<{ message: string }>(
        `/api/participants/${ev.id}`,
      );
      await refresh();
      setMsg({ ok: true, text: res.message });
    } catch (err) {
      const e = err as Error & { action?: string };
      if (e.action === "waitlist") {
        setMsg({
          ok: false,
          text: "Evento lotado. Entre na waitlist para ser chamado!",
          waitlist: true,
        });
      } else {
        setMsg({ ok: false, text: e.message });
      }
    } finally {
      setSaving(false);
    }
  };

  const cancelar = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await api.del<{ message: string }>(
        `/api/participants/${ev.id}`,
      );
      await refresh();
      setMsg({ ok: true, text: res.message });
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const entrarWaitlist = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await api.post<{
        message: string;
        waitlist: { position: number };
      }>(`/api/participants/${ev!.id}/waitlist`);
      await refetchPosicao();
      setMsg({
        ok: true,
        text: `${res.message} Posição: ${res.waitlist.position}º`,
      });
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const sairWaitlist = async () => {
    setSaving(true);
    try {
      await api.del(`/api/participants/${ev!.id}/waitlist`);
      await refetchPosicao();
      setMsg({ ok: true, text: "Você saiu da waitlist." });
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container narrow">
      <span className="badge">{ev.categoria || "Geral"}</span>
      <h1>{ev.titulo}</h1>
      <p className="muted">
        {ev.data} · {ev.horario} · {ev.local}
      </p>
      <p>{ev.descricao}</p>
      <p>
        <strong>
          {livres} de {ev.vagas} vagas livres
        </strong>{" "}
        · {ev.participantes.length} inscritos
      </p>

      {msg && (
        <p className={msg.ok ? "alert-success" : "alert-error"}>{msg.text}</p>
      )}

      {inscrito ? (
        <button className="btn-ghost" onClick={cancelar} disabled={saving}>
          {saving ? "Aguarde…" : "Cancelar inscrição"}
        </button>
      ) : posicao ? (
        <div>
          <p>
            Você está na waitlist — <strong>posição {posicao.position}º</strong>.
          </p>
          <button className="btn-ghost" onClick={sairWaitlist} disabled={saving}>
            Sair da waitlist
          </button>
        </div>
      ) : livres === 0 ? (
        <div>
          <p className="muted">Evento lotado — entre na waitlist e seja chamado!</p>
          <button
            className="btn-primary"
            onClick={entrarWaitlist}
            disabled={saving || !user}
          >
            Entrar na waitlist
          </button>
          {!user && (
            <p className="muted">
              <a href="/login">Entre</a> para participar da waitlist.
            </p>
          )}
        </div>
      ) : (
        <button className="btn-primary" onClick={inscrever} disabled={saving}>
          {saving ? "Reservando…" : "Inscrever-se agora (1-clique)"}
        </button>
      )}

      {msg?.waitlist && !posicao && livres > 0 && (
        <button
          className="btn-primary"
          onClick={entrarWaitlist}
          disabled={saving}
          style={{ marginTop: 12 }}
        >
          Entrar na waitlist
        </button>
      )}
    </main>
  );
}
