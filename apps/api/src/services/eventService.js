import {
  getEventsRepository,
  getEventByNameRepository,
  getEventByIdRepository,
  getEventCategoriesRepository,
  getPublicStatsRepository,
  createEventRepository,
  parcialUpdateEventRepository,
  deleteEventRepository,
  parseEventFilters,
} from "../repositories/eventRepository.js";

export const getEventsService = async (query) => {
  const events = await getEventsRepository(parseEventFilters(query));
  return events;
};

export const getMyEventsService = async (userId, query, userRole) => {
  // Admin vê tudo; organizador só os próprios
  const scoped =
    userRole === "admin" ? query : { ...query, criadoPor: userId };
  return getEventsRepository(parseEventFilters(scoped));
};

export const getEventCategoriesService = async () => {
  return getEventCategoriesRepository();
};

export const getPublicStatsService = async () => getPublicStatsRepository();

export const getEventByNameService = async (name) => {
  // Retorna lista (possivelmente vazia); 404 fica a cargo de quem precisa de um item único
  const events = await getEventByNameRepository(name);
  return events;
};

export const getEventByIdService = async (id) => {
  const event = await getEventByIdRepository(id);
  if (!event) {
    throw new Error("Nenhum evento encontrado com o ID informado");
  }
  return event;
};

export const createEventService = async (eventData, ownerId) => {
  const { participantes, criadoPor, ...updatable } = eventData;
  const newEvent = await createEventRepository({
    ...updatable,
    criadoPor: ownerId ?? null,
  });
  return newEvent;
};

export const parcialUpdateEventService = async (
  id,
  eventData,
  requester = {},
) => {
  // Participantes são gerenciados pelas rotas de inscrição, não por PATCH.
  // `criadoPor` só pode ser reatribuído pelo admin.
  const { participantes, ...updatable } = eventData;
  if (requester.userRole !== "admin") delete updatable.criadoPor;
  const event = await parcialUpdateEventRepository(id, updatable);
  if (!event) {
    throw new Error("Evento não encontrado");
  }
  return event;
};

export const deleteEventService = async (id) => {
  const event = await deleteEventRepository(id);
  if (!event) {
    throw new Error("Evento não encontrado");
  }
  return event;
};
