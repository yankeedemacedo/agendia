export const eventResponseDTO = (event) => {
  if (!event) return null;

  // Se for um documento do Mongoose, converte para objeto puro.
  // Se já for um objeto comum (por causa de um .lean() ou objeto mockado), usa ele mesmo.
  const dadosPuros = event.toObject ? event.toObject() : event;

  // Agora o spread vai funcionar perfeitamente com o seu 'id' customizado!
  const { ...dadosEvent } = dadosPuros;

  return dadosEvent;
};

export const eventListResponseDTO = (events) => {
  if (!events || !Array.isArray(events)) return [];

  // Mapeia a lista aplicando a correção individual em cada evento
  return events.map((event) => eventResponseDTO(event));
};
