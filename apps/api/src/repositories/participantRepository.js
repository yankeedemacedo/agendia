import event from "../models/eventSchema.js";
import user from "../models/userSchema.js";
import ticket from "../models/ticketSchema.js";
import { randomUUID } from "node:crypto";
import { generateCheckInCode } from "../services/qrService.js";

const withStatus = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const getParticipantRepository = async (eventId, participantId) => {
  const foundTicket = await ticket.findOne({
    eventId,
    userId: participantId,
  });
  if (foundTicket) return participantId;

  // Compatibilidade com inscrições anteriores ao Ticket
  const foundEvent = await event.findOne({
    id: eventId,
    participantes: participantId,
  });

  return foundEvent ? participantId : null;
};

export const createParticipantRepository = async (eventId, participantId) => {
  // 1. Verifica se o evento existe
  const foundEvent = await event.findOne({ id: eventId });
  if (!foundEvent) throw withStatus("Evento não encontrado", 404);

  // 2. Verifica se o usuário existe
  const foundUser = await user.findOne({ id: participantId });
  if (!foundUser) throw withStatus("Usuário não encontrado", 404);

  // 3. Evita duplicidade (índice único em Ticket como garantia final)
  if (
    foundEvent.participantes.includes(participantId) ||
    (await ticket.findOne({ eventId, userId: participantId }))
  ) {
    throw withStatus("Participação já registrada para este evento", 409);
  }

  // 4. Inscrição atômica respeitando o limite de vagas ($expr evita
  // overbooking em inscrições concorrentes)
  const updatedEvent = await event.findOneAndUpdate(
    {
      id: eventId,
      $expr: { $lt: [{ $size: "$participantes" }, "$vagas"] },
    },
    { $addToSet: { participantes: participantId } },
    { new: true },
  );

  if (!updatedEvent) {
    const current = await event.findOne({ id: eventId });
    if (!current) throw withStatus("Evento não encontrado", 404);
    if (current.participantes.includes(participantId)) {
      throw withStatus("Participação já registrada para este evento", 409);
    }
    throw withStatus("Evento lotado. Não há vagas disponíveis.", 409);
  }

  try {
    await ticket.create({
      id: randomUUID(),
      eventId,
      userId: participantId,
      checkInCode: generateCheckInCode(),
    });
  } catch (error) {
    // Ganhou a vaga no array mas perdeu a corrida no Ticket: desfaz
    if (error?.code === 11000) {
      await event.updateOne(
        { id: eventId },
        { $pull: { participantes: participantId } },
      );
      throw withStatus("Participação já registrada para este evento", 409);
    }
    throw error;
  }

  await user.updateOne(
    { id: participantId },
    { $addToSet: { eventos: eventId } },
  );

  return updatedEvent.participantes;
};

export const deleteParticipantRepository = async (eventId, participantId) => {
  await Promise.all([
    event.updateOne(
      { id: eventId },
      { $pull: { participantes: participantId } },
    ),
    user.updateOne({ id: participantId }, { $pull: { eventos: eventId } }),
    ticket.deleteOne({ eventId, userId: participantId }),
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
