import ticket from "../models/ticketSchema.js";
import user from "../models/userSchema.js";
import event from "../models/eventSchema.js";
import { parseQrPayload } from "../services/qrService.js";

const withStatus = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ticketDTO = (t) => ({
  id: t.id,
  eventId: t.eventId,
  userId: t.userId,
  status: t.status,
  checkInCode: t.checkInCode,
  checkInAt: t.checkInAt ?? null,
  createdAt: t.createdAt,
});

export const getTicketRepository = async (eventId, userId) => {
  const found = await ticket.findOne({ eventId, userId });
  return found ? ticketDTO(found) : null;
};

export const listTicketsByEventRepository = async (eventId) => {
  const tickets = await ticket
    .find({ eventId })
    .sort({ createdAt: 1 });
  const userIds = [...new Set(tickets.map((t) => t.userId))];
  const users = await user.find({ id: { $in: userIds } });
  const byId = new Map(users.map((u) => [u.id, u]));
  return tickets.map((t) => ({
    ...ticketDTO(t),
    user: (() => {
      const u = byId.get(t.userId);
      return u ? { id: u.id, nome: u.nome, email: u.email } : null;
    })(),
  }));
};

export const checkInTicketRepository = async ({
  qr,
  ticketId,
  code,
  requester,
}) => {
  let parsed = ticketId && code ? { ticketId, code } : parseQrPayload(qr);
  if (!parsed) throw withStatus("QR ou código inválido.", 400);

  const found = await ticket.findOne({ id: parsed.ticketId });
  if (!found || found.checkInCode !== parsed.code) {
    throw withStatus("Ingresso não encontrado ou código inválido.", 404);
  }

  // Organizador só opera o próprio evento; admin opera tudo
  if (requester?.userRole !== "admin") {
    const ev = await event.findOne({ id: found.eventId });
    if (!ev || ev.criadoPor !== requester?.userId) {
      throw withStatus("Acesso negado a este evento.", 403);
    }
  }

  if (found.status === "cancelada") {
    throw withStatus("Inscrição cancelada.", 409);
  }
  if (found.status === "presente") return { ...ticketDTO(found), already: true };

  found.status = "presente";
  found.checkInAt = new Date();
  await found.save();
  return ticketDTO(found);
};

export const cancelTicketRepository = async (eventId, userId) => {
  await ticket.deleteOne({ eventId, userId });
};
