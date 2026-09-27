import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { api } from "../lib/api";
import type { EventItem, Ticket } from "../types";

export function TicketPage() {
  const { id } = useParams();
  const [certError, setCertError] = useState("");

  const { data: ev } = useQuery({
    queryKey: ["event", id],
    queryFn: () => api.get<EventItem>(`/api/events/${id}`),
  });
  const { data: ticket } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => api.get<Ticket>(`/api/participants/${id}/ticket`),
  });

  const baixarCertificado = async () => {
    setCertError("");
    try {
      const res = await fetch(`/api/participants/${id}/certificado`, {
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Não foi possível gerar.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificado-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setCertError((err as Error).message);
    }
  };

  if (!ev || !ticket) {
    return (
      <main className="container narrow">
        <p>Carregando ingresso…</p>
      </main>
    );
  }

  return (
    <main className="container narrow ticket">
      <span className="badge">{ticket.status}</span>
      <h1>{ev.titulo}</h1>
      <p className="muted">
        {ev.data} · {ev.horario} · {ev.local}
      </p>
      <div className="qr">
        <QRCodeSVG value={ticket.qr} size={220} />
      </div>
      <p className="code">Código: {ticket.checkInCode}</p>
      <p className="muted">Apresente o QR na entrada para confirmar presença.</p>

      {ticket.status === "presente" ? (
        <div>
          <p className="alert-success">Presença confirmada. Parabéns!</p>
          <button className="btn-primary" onClick={baixarCertificado}>
            Baixar certificado (PDF)
          </button>
          {certError && <p className="alert-error">{certError}</p>}
        </div>
      ) : (
        certError && <p className="alert-error">{certError}</p>
      )}
    </main>
  );
}
