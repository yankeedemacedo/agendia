import {
  createParticipantRepository,
  deleteParticipantRepository,
  getParticipantRepository,
} from "../repositories/participantRepository.js";
import { promoteFromWaitlistService } from "./waitlistService.js";

export const createParticipantService = async (eventId, participantId) => {
  const existingParticipant = await getParticipantRepository(
    eventId,
    participantId,
  );
  if (existingParticipant) {
    const error = new Error("Participante já registrado para este evento");
    error.statusCode = 409; // Conflito
    throw error;
  }
  try {
    const newParticipant = await createParticipantRepository(
      eventId,
      participantId,
    );
    return newParticipant;
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    throw error;
  }
};

export const deleteParticipantService = async (eventId, participantId) => {
  const existingParticipant = await getParticipantRepository(
    eventId,
    participantId,
  );
  if (!existingParticipant) {
    const error = new Error("Participante não encontrado para este evento");
    error.statusCode = 404; // Não encontrado
    throw error;
  }
  try {
    const participant = await deleteParticipantRepository(
      eventId,
      participantId,
    );
    // Vaga liberou: promove o primeiro da waitlist (best-effort)
    const promoted = await promoteFromWaitlistService(eventId).catch(() => null);
    return { participant, promoted };
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    throw error;
  }
};
