import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { eventResponseDTO, eventListResponseDTO } from "../src/dtos/eventDTO.js";
import {
  usersResponseDTO,
  usersListResponseDTO,
} from "../src/dtos/usersDTO.js";

describe("eventResponseDTO", () => {
  it("retorna só os campos explícitos (sem _id/__v)", () => {
    const dto = eventResponseDTO({
      _id: "mongo-id",
      __v: 0,
      id: "uuid-1",
      titulo: "Aula",
      descricao: "x",
      data: "01-01-2026",
      horario: "10:00",
      local: "Sala",
      acesso: "Público",
      vagas: 10,
      participantes: ["u1"],
      campoEstranho: "fora",
    });
    assert.deepEqual(dto, {
      id: "uuid-1",
      titulo: "Aula",
      descricao: "x",
      data: "01-01-2026",
      horario: "10:00",
      local: "Sala",
      acesso: "Público",
      vagas: 10,
      categoria: undefined,
      tags: [],
      status: undefined,
      capaUrl: undefined,
      inicio: undefined,
      fim: undefined,
      criadoPor: undefined,
      participantes: ["u1"],
    });
  });

  it("normaliza participantes ausentes para []", () => {
    const dto = eventResponseDTO({ id: "a", titulo: "t" });
    assert.deepEqual(dto.participantes, []);
  });

  it("retorna null para evento nulo e [] para lista inválida", () => {
    assert.equal(eventResponseDTO(null), null);
    assert.deepEqual(eventListResponseDTO(null), []);
  });
});

describe("usersResponseDTO", () => {
  it("nunca vaza senha/_id/__v/cpf", () => {
    const dto = usersResponseDTO({
      _id: "mongo-id",
      __v: 0,
      id: "uuid-9",
      nome: "Ana",
      email: "ana@mail.com",
      telefone: "84999998888",
      dataNascimento: "2000-01-01",
      cpf: "12345678901",
      senha: "$2b$10$hash",
      papel: "user",
      eventos: ["e1"],
    });
    assert.deepEqual(dto, {
      id: "uuid-9",
      nome: "Ana",
      email: "ana@mail.com",
      telefone: "84999998888",
      dataNascimento: "2000-01-01",
      papel: "user",
      eventos: ["e1"],
    });
  });

  it("normaliza eventos ausentes para []", () => {
    const dto = usersResponseDTO({ id: "a", nome: "B" });
    assert.deepEqual(dto.eventos, []);
  });

  it("retorna null para usuário nulo e [] para lista inválida", () => {
    assert.equal(usersResponseDTO(null), null);
    assert.deepEqual(usersListResponseDTO(undefined), []);
  });
});
