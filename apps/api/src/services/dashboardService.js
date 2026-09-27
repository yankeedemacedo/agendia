import event from "../models/eventSchema.js";
import ticket from "../models/ticketSchema.js";
import waitlist from "../models/waitlistSchema.js";
import { eventResponseDTO } from "../dtos/eventDTO.js";

// Estatística pura (testável sem banco)
export const computeEventStats = ({
  vagas = 0,
  inscritos = 0,
  presentes = 0,
  waitlist = 0,
} = {}) => {
  const ausentes = Math.max(0, inscritos - presentes);
  return {
    vagas,
    inscritos,
    presentes,
    ausentes,
    waitlist,
    ocupacao: vagas > 0 ? Math.round((inscritos / vagas) * 100) : 0,
    taxaPresenca: inscritos > 0 ? Math.round((presentes / inscritos) * 100) : 0,
  };
};

const countPresentes = (tickets) =>
  tickets.filter((t) => t.status === "presente").length;

export const getEventDashboardService = async (eventId) => {
  const found = await event.findOne({ id: eventId });
  if (!found) {
    const error = new Error("Evento não encontrado.");
    error.statusCode = 404;
    throw error;
  }
  const [tickets, fila] = await Promise.all([
    ticket.find({ eventId }),
    waitlist.countDocuments({ eventId }),
  ]);
  return {
    event: eventResponseDTO(found),
    stats: computeEventStats({
      vagas: found.vagas,
      inscritos: found.participantes.length,
      presentes: countPresentes(tickets),
      waitlist: fila,
    }),
  };
};

export const getGlobalDashboardService = async ({ criadoPor } = {}) => {
  const filter = criadoPor ? { criadoPor } : {};
  const events = await event.find(filter);
  const ids = events.map((e) => e.id);
  const [tickets, filas] = await Promise.all([
    ticket.find({ eventId: { $in: ids } }),
    waitlist.aggregate([
      { $match: { eventId: { $in: ids } } },
      { $group: { _id: "$eventId", total: { $sum: 1 } } },
    ]),
  ]);
  const filaPorEvento = new Map(filas.map((f) => [f._id, f.total]));

  const linhas = events.map((e) => {
    const doEvento = tickets.filter((t) => t.eventId === e.id);
    return {
      event: eventResponseDTO(e),
      stats: computeEventStats({
        vagas: e.vagas,
        inscritos: e.participantes.length,
        presentes: countPresentes(doEvento),
        waitlist: filaPorEvento.get(e.id) ?? 0,
      }),
    };
  });

  const total = linhas.reduce(
    (acc, l) => ({
      vagas: acc.vagas + l.stats.vagas,
      inscritos: acc.inscritos + l.stats.inscritos,
      presentes: acc.presentes + l.stats.presentes,
      waitlist: acc.waitlist + l.stats.waitlist,
    }),
    { vagas: 0, inscritos: 0, presentes: 0, waitlist: 0 },
  );

  const top = [...linhas]
    .sort((a, b) => b.stats.inscritos - a.stats.inscritos)
    .slice(0, 5);

  return {
    resumo: {
      eventos: events.length,
      ...computeEventStats(total),
    },
    top,
    eventos: linhas,
  };
};
