import {
  createParticipantService,
  deleteParticipantService,
} from "../services/participantService.js";

export const createParticipant = async (req, res, next) => {
  try {
    const participantId = req.userId;
    const eventId = req.params.id;
    const participant = await createParticipantService(eventId, participantId);
    res
      .status(201)
      .json({ message: "Participação registrada com sucesso", participant });
  } catch (error) {
    next(error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const deleteParticipant = async (req, res, next) => {
  try {
    const eventId = req.params.id; // Supondo que o ID do evento seja enviado como parâmetro da rota
    const participantId = req.userId; // Supondo que o ID do participante seja obtido do token de autenticação
    await deleteParticipantService(eventId, participantId);
    res.json({ message: "Participação removida com sucesso" });
  } catch (error) {
    next(error);
  }
};
