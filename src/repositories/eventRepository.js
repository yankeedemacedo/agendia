import event from "../models/eventSchema.js";
import { eventListResponseDTO, eventResponseDTO } from "../dtos/eventDTO.js";
import { randomUUID } from "node:crypto";

export const getEventsRepository = async () => {
  const events = await event.find();
  return eventListResponseDTO(events);
};

export const getEventByIdRepository = async (id) => {
  const foundEvent = await event.findOne({ id: id });
  return foundEvent ? eventResponseDTO(foundEvent) : null;
};

export const getEventByNameRepository = async (name) => {
  const events = await event.find({
    titulo: { $regex: name, $options: "i" },
  });
  return eventListResponseDTO(events);
};

export const createEventRepository = async (eventData) => {
  const newEvent = new event({
    id: randomUUID(),
    ...eventData,
    participantes: [],
  });

  await newEvent.save();
  console.log(`event repository - newEvent: ${JSON.stringify(newEvent)}`);
  return eventResponseDTO(newEvent);
};

export const parcialUpdateEventRepository = async (id, eventData) => {
  // Atualiza buscando pelo campo 'id'
  const updatedEvent = await event.findOneAndUpdate(
    { id: id },
    { $set: eventData },
    { new: true, runValidators: true },
  );

  return updatedEvent ? eventResponseDTO(updatedEvent) : null;
};

export const deleteEventRepository = async (id) => {
  const deletedEvent = await event.findOneAndDelete({ id: id });
  return deletedEvent ? eventResponseDTO(deletedEvent) : null;
};

export const getNowCapacityRepository = async (eventId) => {
  const foundEvent = await event.findOne({ id: eventId });
  if (!foundEvent) return 0;

  const capacity = foundEvent.vagas - foundEvent.participantes.length;
  return capacity;
};
