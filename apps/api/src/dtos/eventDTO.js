const EVENT_FIELDS = [
  "id",
  "titulo",
  "descricao",
  "data",
  "horario",
  "local",
  "acesso",
  "vagas",
  "categoria",
  "tags",
  "status",
  "capaUrl",
  "inicio",
  "fim",
  "criadoPor",
  "participantes",
];

export const eventResponseDTO = (event) => {
  if (!event) return null;

  // Se for um documento do Mongoose, converte para objeto puro.
  // Se já for um objeto comum (por causa de um .lean() ou objeto mockado), usa ele mesmo.
  const dadosPuros = event.toObject ? event.toObject() : event;

  // Campos explícitos: nunca vaza `_id` ou `__v`
  const dto = {};
  for (const field of EVENT_FIELDS) {
    dto[field] = dadosPuros[field];
  }
  if (!Array.isArray(dto.participantes)) dto.participantes = [];
  if (!Array.isArray(dto.tags)) dto.tags = [];

  return dto;
};

export const eventListResponseDTO = (events) => {
  if (!events || !Array.isArray(events)) return [];

  // Mapeia a lista aplicando a correção individual em cada evento
  return events.map((event) => eventResponseDTO(event));
};
