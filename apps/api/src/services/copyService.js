import {
  getEventByIdRepository,
  createEventRepository,
} from "../repositories/eventRepository.js";

// Desloca data ISO em semanas/meses (puro, testável)
export const shiftRecurrence = (iso, aCada, vezes) => {
  const base = new Date(iso);
  const out = [];
  for (let i = 1; i <= vezes; i += 1) {
    const d = new Date(base);
    if (aCada === "semana") d.setDate(d.getDate() + 7 * i);
    else d.setMonth(d.getMonth() + i);
    out.push(d.toISOString());
  }
  return out;
};

export const duplicateEventService = async (id) => {
  const base = await getEventByIdRepository(id);
  if (!base) {
    const error = new Error("Evento não encontrado.");
    error.statusCode = 404;
    throw error;
  }
  const { id: _id, participantes, ...resto } = base;
  return createEventRepository({
    ...resto,
    titulo: `${base.titulo} (cópia)`,
    status: "rascunho",
  });
};

export const createRecurrenceService = async (id, { aCada, vezes }) => {
  const base = await getEventByIdRepository(id);
  if (!base) {
    const error = new Error("Evento não encontrado.");
    error.statusCode = 404;
    throw error;
  }
  if (!base.inicio) {
    const error = new Error("Evento base precisa de data de início.");
    error.statusCode = 400;
    throw error;
  }
  const inicios = shiftRecurrence(base.inicio, aCada, vezes);
  const criados = [];
  for (let i = 0; i < inicios.length; i += 1) {
    const { id: _id, participantes, ...resto } = base;
    criados.push(
      await createEventRepository({
        ...resto,
        titulo: `${base.titulo} (${i + 2})`,
        status: "rascunho",
        inicio: inicios[i],
        fim: base.fim
          ? new Date(
              new Date(inicios[i]).getTime() +
                (new Date(base.fim).getTime() - new Date(base.inicio).getTime()),
            ).toISOString()
          : undefined,
      }),
    );
  }
  return criados;
};
