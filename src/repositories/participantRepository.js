import event from "../models/eventSchema.js";
import user from "../models/userSchema.js";

export const getParticipantRepository = async (eventId, participantId) => {
  const foundEvent = await event.findOne({
    id: eventId,
    participantes: participantId,
  });

  return foundEvent ? participantId : null;
};

export const createParticipantRepository = async (eventId, participantId) => {
  // 1. Verifica se o evento existe
  const foundEvent = await event.findOne({ id: eventId });
  if (!foundEvent) throw new Error("Evento não encontrado no banco");

  // 2. Verifica se o usuário existe
  const foundUser = await user.findOne({ id: participantId });
  if (!foundUser) throw new Error("Usuário não encontrado no banco");

  // 3. Evita duplicidade usando o $addToSet (só adiciona se não existir no array)
  // Se o participante já existir, o MongoDB não faz nada
  if (foundEvent.participantes.includes(participantId)) {
    throw new Error("Participação já registrada para este evento");
  }

  // 4. Executa as atualizações atômicas em paralelo para melhor performance
  await Promise.all([
    event.updateOne(
      { id: eventId },
      { $addToSet: { participantes: participantId } },
    ),
    user.updateOne({ id: participantId }, { $addToSet: { eventos: eventId } }),
  ]);

  // Busca o evento atualizado para retornar a lista de participantes
  const updatedEvent = await event.findOne({ id: eventId });
  return updatedEvent.participantes;
};

export const deleteParticipantRepository = async (eventId, participantId) => {
  await Promise.all([
    event.updateOne(
      { id: eventId },
      { $pull: { participantes: participantId } },
    ),
    user.updateOne({ id: participantId }, { $pull: { eventos: eventId } }),
  ]);

  return participantId;
};

export const getMyEventsRepository = async (participantId) => {
  const foundUser = await user.findOne({ id: participantId });
  if (!foundUser || !foundUser.eventos || foundUser.eventos.length === 0) {
    return [];
  }

  const completeEvents = await event.find({
    id: { $in: foundUser.eventos },
  });

  return completeEvents;
};
