import {
  joinWaitlistRepository,
  leaveWaitlistRepository,
  getWaitlistPositionRepository,
  peekFirstWaitlistRepository,
  removeWaitlistEntryRepository,
  listWaitlistByEventRepository,
} from "../repositories/waitlistRepository.js";
import {
  createParticipantRepository,
  getParticipantRepository,
} from "../repositories/participantRepository.js";
import { getNowCapacityRepository } from "../repositories/eventRepository.js";
import { getEventByIdRepository } from "../repositories/eventRepository.js";
import { getUserByIdRepository } from "../repositories/usersRepository.js";
import { sendMail, promotionEmail } from "./mailService.js";

const withStatus = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const joinWaitlistService = async (eventId, userId) => {
  const already = await getParticipantRepository(eventId, userId);
  if (already) throw withStatus("Você já está inscrito neste evento.", 409);

  const livres = await getNowCapacityRepository(eventId);
  if (livres > 0) {
    const err = withStatus(
      "Há vagas disponíveis — inscreva-se diretamente.",
      400,
    );
    err.action = "subscribe";
    throw err;
  }

  const entry = await joinWaitlistRepository(eventId, userId);
  const position = await getWaitlistPositionRepository(eventId, userId);
  return { ...entry, position };
};

export const leaveWaitlistService = async (eventId, userId) => {
  const removed = await leaveWaitlistRepository(eventId, userId);
  if (!removed) throw withStatus("Você não está na waitlist.", 404);
  return { message: "Saída da waitlist registrada." };
};

export const getWaitlistPositionService = async (eventId, userId) => {
  const position = await getWaitlistPositionRepository(eventId, userId);
  if (!position) throw withStatus("Você não está na waitlist.", 404);
  return { eventId, position };
};

export const listWaitlistService = async (eventId) =>
  listWaitlistByEventRepository(eventId);

// Promove o primeiro da fila ao liberar vaga (cancelamento).
// Best-effort: se a vaga sumir numa corrida, mantém na fila.
export const promoteFromWaitlistService = async (eventId) => {
  const first = await peekFirstWaitlistRepository(eventId);
  if (!first) return null;

  try {
    await createParticipantRepository(eventId, first.userId);
  } catch (error) {
    if (error?.statusCode === 409) return null;
    throw error;
  }
  await removeWaitlistEntryRepository(eventId, first.userId);

  try {
    const [ev, usr] = await Promise.all([
      getEventByIdRepository(eventId),
      getUserByIdRepository(first.userId),
    ]);
    if (ev && usr) await sendMail({ to: usr.email, ...promotionEmail(ev, usr) });
  } catch {
    // E-mail é best-effort; a promoção já valeu
  }

  return { eventId, userId: first.userId };
};
