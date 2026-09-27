import event from "../models/eventSchema.js";
import user from "../models/userSchema.js";
import ticket from "../models/ticketSchema.js";
import { eventListResponseDTO, eventResponseDTO } from "../dtos/eventDTO.js";
import { randomUUID } from "node:crypto";

const MAX_LIMIT = 50;

export const parseEventFilters = (query = {}) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.parseInt(query.limit, 10) || 12),
  );
  return {
    search: typeof query.search === "string" ? query.search.trim() : "",
    categoria: typeof query.categoria === "string" ? query.categoria.trim() : "",
    status: typeof query.status === "string" ? query.status.trim() : "",
    criadoPor: typeof query.criadoPor === "string" ? query.criadoPor : "",
    page,
    limit,
  };
};

export const buildEventFilter = ({ search, categoria, status, criadoPor }) => {
  const filter = {};
  if (search) filter.titulo = { $regex: search, $options: "i" };
  // $in com null também casa documentos legados sem o campo
  if (categoria) filter.categoria = { $in: [categoria, null, ""] };
  if (status) filter.status = { $in: [status, null, ""] };
  if (criadoPor) filter.criadoPor = criadoPor;
  return filter;
};

export const getEventsRepository = async (filters = {}) => {
  const { page, limit } = filters;
  const filter = buildEventFilter(filters);

  // Sem paginação explícita mantém o comportamento legado (lista pura)
  if (!page && !limit) {
    const events = await event.find(filter);
    return eventListResponseDTO(events);
  }

  const skip = (page - 1) * limit;
  const [events, total] = await Promise.all([
    event.find(filter).skip(skip).limit(limit),
    event.countDocuments(filter),
  ]);
  return {
    data: eventListResponseDTO(events),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
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

export const getEventCategoriesRepository = async () => {
  const categorias = await event.distinct("categoria");
  return categorias.filter(Boolean);
};

// Números públicos do hero (só publicados + legados sem status)
export const getPublicStatsRepository = async () => {
  const filter = { status: { $in: ["publicado", null, ""] } };
  const events = await event.find(filter);
  const inscritos = events.reduce(
    (acc, e) => acc + (e.participantes?.length ?? 0),
    0,
  );
  const vagas = events.reduce((acc, e) => acc + (e.vagas ?? 0), 0);
  const categorias = new Set(events.map((e) => e.categoria).filter(Boolean));
  return {
    eventos: events.length,
    inscritos,
    vagasLivres: Math.max(0, vagas - inscritos),
    categorias: categorias.size,
  };
};

export const createEventRepository = async (eventData) => {
  const newEvent = new event({
    id: randomUUID(),
    ...eventData,
    participantes: [],
  });

  await newEvent.save();
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
  if (!deletedEvent) return null;

  // Limpa referências órfãs nos usuários inscritos e os tickets
  await Promise.all([
    user.updateMany({ eventos: id }, { $pull: { eventos: id } }),
    ticket.deleteMany({ eventId: id }),
  ]);

  return eventResponseDTO(deletedEvent);
};

export const getNowCapacityRepository = async (eventId) => {
  const foundEvent = await event.findOne({ id: eventId });
  if (!foundEvent) return 0;

  const capacity = foundEvent.vagas - foundEvent.participantes.length;
  return capacity;
};
