import {
  createParticipantRepository,
  deleteParticipantRepository,
  getParticipantRepository,
} from "../repositories/participantRepository.js";

export const createParticipantService = async (eventId, participantId) => {
  try {
    const existingParticipant = await getParticipantRepository(
      eventId,
      participantId,
    );
    if (existingParticipant) {
      throw new Error("Participante já registrado para este evento");
    }
    const newParticipant = await createParticipantRepository(
      eventId,
      participantId,
    );
    return newParticipant;
  } catch (error) {
    if (error.message === "Participante já registrado para este evento") {
      error.statusCode = 409; // Conflito
    } else {
      error.statusCode = 500; // Erro interno do servidor
    }
    throw error;
  }
};

export const deleteParticipantService = async (eventId, participantId) => {
  try {
    console.log("Deletando participante:", { eventId, participantId });
    const existingParticipant = await getParticipantRepository(
      eventId,
      participantId,
    );
    if (!existingParticipant) {
      throw new Error("Participante não encontrado para este evento");
    }
    const participant = await deleteParticipantRepository(
      eventId,
      participantId,
    );
    return participant;
  } catch (error) {
    if (error.message === "Participante não encontrado para este evento") {
      error.statusCode = 404; // Não encontrado
    } else {
      error.statusCode = 500; // Erro interno do servidor
    }
    throw error;
  }
};
