// Seed do banco de TESTE: apaga e recria usuários, eventos, tickets e waitlist.
//
// Uso: node apps/api/scripts/seed.js [--events 60]
// Determinístico (PRNG com seed fixo): toda execução gera o mesmo banco.
// Credenciais (senha única): senha123
//   admin@agendia.test (admin) · org@, rui@, sara@agendia.test (organizers)
//   ana@, bruno@, carla@, diana@, edu@agendia.test (users)

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import "../src/config/env.js";
import { MONGO_URI } from "../src/config/env.js";
import user from "../src/models/userSchema.js";
import event from "../src/models/eventSchema.js";
import ticket from "../src/models/ticketSchema.js";
import waitlist from "../src/models/waitlistSchema.js";
import { generateCheckInCode } from "../src/services/qrService.js";

const N_ARG = process.argv.find((a) => a.startsWith("--events"));
const N_EXTRA = Math.max(0, Number(N_ARG?.split("=")[1] ?? 60) - 0);

// PRNG determinístico (mulberry32)
let seed = 42;
const rand = () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const int = (min, max) => min + Math.floor(rand() * (max - min + 1));
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const SENHA = "senha123";
const dia = 24 * 60 * 60 * 1000;
const fmtData = (d) =>
  `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
const fmtHora = (d) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

await mongoose.connect(MONGO_URI, { dbName: "agendia" });
await Promise.all([
  user.deleteMany({}),
  event.deleteMany({}),
  ticket.deleteMany({}),
  waitlist.deleteMany({}),
]);

const hash = await bcrypt.hash(SENHA, 10);
const U = {};
for (const [key, nome, email, cpf, papel] of [
  ["admin", "Yankee Admin", "admin@agendia.test", "11111111111", "admin"],
  ["org", "Olivia Org", "org@agendia.test", "22222222222", "organizer"],
  ["rui", "Rui Org", "rui@agendia.test", "88888888888", "organizer"],
  ["sara", "Sara Org", "sara@agendia.test", "99999999999", "organizer"],
  ["ana", "Ana Teste", "ana@agendia.test", "33333333333"],
  ["bruno", "Bruno Teste", "bruno@agendia.test", "44444444444"],
  ["carla", "Carla Teste", "carla@agendia.test", "55555555555"],
  ["diana", "Diana Teste", "diana@agendia.test", "66666666666"],
  ["edu", "Edu Teste", "edu@agendia.test", "77777777777"],
]) {
  U[key] = await user.create({
    id: randomUUID(),
    nome,
    email,
    telefone: "84999990000",
    dataNascimento: new Date("1995-06-15"),
    cpf,
    senha: hash,
    papel: papel ?? "user",
    eventos: [],
  });
}
const users = ["ana", "bruno", "carla", "diana", "edu"].map((k) => U[k]);
const orgs = [U.org, U.rui, U.sara, U.admin];

const agora = Date.now();
const mkEvent = (titulo, categoria, vagas, diasParaInicio, opts = {}) => {
  const inicio = new Date(agora + diasParaInicio * dia);
  inicio.setHours(pick([9, 14, 19]), 0, 0, 0);
  return {
    id: randomUUID(),
    titulo,
    descricao: `Descrição de teste para ${titulo}.`,
    data: fmtData(inicio),
    horario: fmtHora(inicio),
    local: opts.local ?? pick(["Auditório Central", "Galpão 7", "Parque da Cidade", "Hub Tech"]),
    acesso: opts.acesso ?? (rand() < 0.15 ? "Privado" : "Público"),
    vagas,
    categoria,
    tags: [categoria.toLowerCase()],
    status: opts.status ?? "publicado",
    capaUrl: "",
    inicio,
    fim: new Date(inicio.getTime() + 2 * 60 * 60 * 1000),
    criadoPor: opts.criadoPor ?? pick(orgs).id,
    participantes: [],
  };
};

const subscribe = async (ev, usr, status = "ativa") => {
  await ticket.create({
    id: randomUUID(),
    eventId: ev.id,
    userId: usr.id,
    status,
    checkInCode: generateCheckInCode(),
    checkInAt: status === "presente" ? new Date() : undefined,
  });
  ev.participantes.push(usr.id);
  usr.eventos.push(ev.id);
};

// ---- Casos curados (fluxos de teste) ----
const E = [];
E.push(await event.create(mkEvent("Deploy Conf 2026", "Tech", 5, 2, { criadoPor: U.org.id }))); // lotado
for (const k of ["ana", "bruno", "carla", "diana", "admin"]) await subscribe(E[0], U[k]);
for (const k of ["edu", "org"]) {
  await waitlist.create({ id: randomUUID(), eventId: E[0].id, userId: U[k].id });
}
E.push(await event.create(mkEvent("Noite Sintetizadores", "Música", 80, 4)));
await subscribe(E[1], U.ana, "presente"); // p/ testar certificado
await subscribe(E[1], U.bruno);
E.push(await event.create(mkEvent("Show Retrowave", "Música", 200, -3, { status: "encerrado" })));
E.push(await event.create(mkEvent("Hackathon 48h", "Tech", 30, 12, { status: "rascunho" })));

// ---- Volume gerado ----
const TITULOS = {
  Tech: ["DevOps na Prática", "IA Aplicada", "Frontend Moderno", "Dados em Escala", "Segurança Ofensiva", "Cloud Nativa", "Mobile Days", "QA & Testes"],
  Música: ["Jazz ao Pôr do Sol", "Eletrônica Autoral", "Samba de Raiz", "Rock Independente", "MPB Acústico", "Festival Cordas"],
  Esporte: ["Corrida Noturna 10k", "Yoga no Parque", "Torneio de Xadrez", "Ciclismo Urbano", "Beach Tênis Open", "Cross Funcional"],
  Negócios: ["Pitch & Capital", "Imersão Datos", "Marketing Digital", "Finanças Pessoais", "Liderança Ágil", "E-commerce Day"],
  Cultura: ["Feira Pixel Art", "Clube do Livro Sci-Fi", "Cinema ao Ar Livre", "Teatro de Rua", "Fotografia Urbana", "Gastronomia Local"],
};
const cats = Object.keys(TITULOS);
const usados = new Set(E.map((e) => e.titulo));

for (let i = 0; i < N_EXTRA; i += 1) {
  const cat = cats[i % cats.length];
  const base = TITULOS[cat][Math.floor(i / cats.length) % TITULOS[cat].length];
  let titulo = `${base} — Ed. ${Math.floor(i / (cats.length * TITULOS[cat].length)) + 1}`;
  if (usados.has(titulo)) titulo += ` (${i})`;
  usados.add(titulo);

  const r = rand();
  const status = r < 0.85 ? "publicado" : r < 0.95 ? "rascunho" : "encerrado";
  const dias = status === "encerrado" ? -int(1, 30) : int(1, 60);
  const ev = await event.create(
    mkEvent(titulo, cat, pick([5, 8, 15, 25, 40, 60, 100, 150]), dias, { status }),
  );
  E.push(ev);

  // Inscrições proporcionais; alguns lotam e geram waitlist
  if (status === "publicado" && dias > 0) {
    const ordem = [...users].sort(() => rand() - 0.5);
    const n = int(0, Math.min(ev.vagas + 2, users.length + 1));
    const inscritos = ordem.slice(0, Math.min(n, ev.vagas));
    for (const u of inscritos) await subscribe(ev, u);
    if (n > ev.vagas) {
      const fora = ordem.filter((u) => !inscritos.includes(u));
      for (let j = 0; j < Math.min(n - ev.vagas, fora.length); j += 1) {
        await waitlist.create({ id: randomUUID(), eventId: ev.id, userId: fora[j].id });
      }
    }
  }
}

for (const k of Object.keys(U)) await U[k].save();
for (const ev of E) await ev.save();

const [nu, ne, nt, nw] = await Promise.all([
  user.countDocuments(),
  event.countDocuments(),
  ticket.countDocuments(),
  waitlist.countDocuments(),
]);
console.log(`Seed OK: ${nu} usuários, ${ne} eventos, ${nt} tickets, ${nw} na waitlist.`);
console.log("Login: admin@agendia.test / org@agendia.test / ana@agendia.test — senha: senha123");
await mongoose.disconnect();
