import { Suspense, lazy, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Attendee, EventItem, WaitlistEntry } from "../types";

const QrScanner = lazy(() =>
  import("../components/QrScanner").then((m) => ({ default: m.QrScanner })),
);

export function Attendees() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const { data: ev } = useQuery({
    queryKey: ["admin-event", id],
    queryFn: () => api.get<EventItem>(`/api/events/${id}`),
  });
  const { data: attendees } = useQuery({
    queryKey: ["attendees", id],
    queryFn: () => api.get<Attendee[]>(`/api/participants/${id}/attendees`),
  });
  const { data: waitlist } = useQuery({
    queryKey: ["admin-waitlist", id],
    queryFn: () => api.get<WaitlistEntry[]>(`/api/participants/${id}/waitlist`),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["attendees", id] });
    void queryClient.invalidateQueries({ queryKey: ["admin-waitlist", id] });
  };

  const exportarCsv = async () => {
    const res = await fetch(`/api/events/${id}/export`, {
      credentials: "include",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMsg({ ok: false, text: body.message ?? "Falha ao exportar." });
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `participantes-${id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const checkIn = async (payload: { qr?: string; ticketId?: string; code?: string }) => {
    setMsg(null);
    try {
      const res = await api.post<{ message: string }>("/api/participants/checkin", payload);
      setMsg({ ok: true, text: res.message });
      setCode("");
      refresh();
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    }
  };

  // Estável entre renders para não reiniciar a câmera a cada leitura
  const handleScan = useCallback(
    (texto: string) => {
      void checkIn({ qr: texto });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  const presentes = (attendees ?? []).filter((a) => a.status === "presente").length;

  return (
    <main className="container">
      <h1>Presença — {ev?.titulo ?? "…"}</h1>
      <p className="muted">
        {presentes} presentes de {(attendees ?? []).length} inscritos
        {(waitlist?.length ?? 0) > 0 && ` · ${waitlist!.length} na waitlist`}
      </p>
      <p>
        <button className="btn-ghost" onClick={exportarCsv}>
          Exportar CSV
        </button>
      </p>

      {msg && (
        <p className={msg.ok ? "alert-success" : "alert-error"}>{msg.text}</p>
      )}

      <form
        className="filters"
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) void checkIn({ qr: code.trim() });
        }}
      >
        <input
          className="input"
          placeholder="Cole o QR ou ticketId:código…"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button className="btn-primary" type="submit">
          Confirmar presença
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setScanning((s) => !s)}
        >
          {scanning ? "Fechar câmera" : "Escanear QR"}
        </button>
      </form>

      {scanning && (
        <Suspense fallback={<p className="muted">Carregando câmera…</p>}>
          <QrScanner onScan={handleScan} onClose={() => setScanning(false)} />
        </Suspense>
      )}

      <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(attendees ?? []).map((a) => (
            <tr key={a.id}>
              <td>{a.user?.nome ?? a.userId}</td>
              <td>{a.user?.email ?? "—"}</td>
              <td>{a.status}</td>
              <td className="actions">
                {a.status !== "presente" && (
                  <button
                    className="link-primary"
                    onClick={() => void checkIn({ ticketId: a.id, code: a.checkInCode })}
                  >
                    Confirmar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {(waitlist?.length ?? 0) > 0 && (
        <section>
          <h2>Waitlist ({waitlist!.length})</h2>
          <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>E-mail</th>
              </tr>
            </thead>
            <tbody>
              {waitlist!.map((w) => (
                <tr key={w.userId}>
                  <td>{w.position}º</td>
                  <td>{w.user?.nome ?? w.userId}</td>
                  <td>{w.user?.email ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>
      )}
    </main>
  );
}
