// Backfill Fase 1: cria Tickets a partir dos arrays legados
// `event.participantes[]` e preenche `inicio` a partir de `data`+`horario`.
//
// Uso: npm run start --workspace @agendia/api -- desligado; rode com:
//   node apps/api/scripts/backfill-tickets.js
// Idempotente: pode rodar quantas vezes quiser (ordered:false ignora duplicados).

import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import "../src/config/env.js";
import event from "../src/models/eventSchema.js";
import ticket from "../src/models/ticketSchema.js";
import { MONGO_URI } from "../src/config/env.js";

const parseInicio = (data, horario) => {
  // data: "DD-MM-YYYY", horario: "HH:mm"
  if (!data || !horario) return undefined;
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(data);
  const hmatch = /^(\d{2}):(\d{2})$/.exec(horario);
  if (!match || !hmatch) return undefined;
  const [, dd, mm, yyyy] = match;
  const [, hh, min] = hmatch;
  const date = new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

await mongoose.connect(MONGO_URI, { dbName: "agendia" });

const events = await event.find();
let ticketsCriados = 0;
let eventosComData = 0;

for (const ev of events) {
  if (!ev.inicio) {
    const inicio = parseInicio(ev.data, ev.horario);
    if (inicio) {
      ev.inicio = inicio;
      await ev.save();
      eventosComData += 1;
    }
  }

  if (Array.isArray(ev.participantes) && ev.participantes.length > 0) {
    const docs = ev.participantes.map((userId) => ({
      id: randomUUID(),
      eventId: ev.id,
      userId,
    }));
    try {
      const inserted = await ticket.insertMany(docs, { ordered: false });
      ticketsCriados += inserted.length;
    } catch (error) {
      // ordered:false insere o que dá e agrega erros de duplicata em writeErrors
      ticketsCriados += error?.result?.nInserted ?? 0;
    }
  }
}

console.log(`Tickets criados: ${ticketsCriados}`);
console.log(`Eventos com inicio preenchido: ${eventosComData}`);

// Fase 2: garante checkInCode em tickets antigos (schema agora exige)
const { generateCheckInCode } = await import("../src/services/qrService.js");
const semCodigo = await ticket.find({
  $or: [{ checkInCode: { $exists: false } }, { checkInCode: null }],
});
let codigos = 0;
for (const t of semCodigo) {
  t.checkInCode = generateCheckInCode();
  if (!t.status) t.status = "ativa";
  await t.save();
  codigos += 1;
}
console.log(`Tickets com código preenchido: ${codigos}`);
await mongoose.disconnect();
