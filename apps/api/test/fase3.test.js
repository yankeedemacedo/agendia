import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeEventStats } from "../src/services/dashboardService.js";
import { buildAttendeesCsv } from "../src/services/exportService.js";
import { shiftRecurrence } from "../src/services/copyService.js";
import { canOperateEvent } from "../src/middlewares/eventOwnerMiddleware.js";

describe("canOperateEvent", () => {
  it("admin opera tudo, inclusive legado sem dono", () => {
    assert.equal(
      canOperateEvent({ userRole: "admin", userId: "a", criadoPor: null }),
      true,
    );
  });

  it("organizador só opera o próprio evento", () => {
    assert.equal(
      canOperateEvent({ userRole: "organizer", userId: "o1", criadoPor: "o1" }),
      true,
    );
    assert.equal(
      canOperateEvent({ userRole: "organizer", userId: "o1", criadoPor: "o2" }),
      false,
    );
    assert.equal(
      canOperateEvent({ userRole: "organizer", userId: "o1", criadoPor: null }),
      false,
    );
  });

  it("user comum nunca opera", () => {
    assert.equal(
      canOperateEvent({ userRole: "user", userId: "u", criadoPor: "u" }),
      false,
    );
  });
});

describe("computeEventStats", () => {
  it("calcula ocupação, presença e ausentes", () => {
    assert.deepEqual(
      computeEventStats({ vagas: 10, inscritos: 8, presentes: 6, waitlist: 2 }),
      {
        vagas: 10,
        inscritos: 8,
        presentes: 6,
        ausentes: 2,
        waitlist: 2,
        ocupacao: 80,
        taxaPresenca: 75,
      },
    );
  });

  it("zera divisões sem inscritos/vagas", () => {
    const s = computeEventStats({});
    assert.equal(s.ocupacao, 0);
    assert.equal(s.taxaPresenca, 0);
    assert.equal(s.ausentes, 0);
  });
});

describe("buildAttendeesCsv", () => {
  it("gera cabeçalho + linhas com escape", () => {
    const csv = buildAttendeesCsv([
      {
        user: { nome: 'Ana "A"', email: "ana@mail.com" },
        status: "presente",
        checkInAt: "2026-01-01T10:00:00.000Z",
      },
      { user: null, status: "ativa", checkInAt: null },
    ]);
    const lines = csv.split("\n");
    assert.equal(lines[0], "nome;email;status;checkin_em");
    assert.equal(
      lines[1],
      '"Ana ""A""";ana@mail.com;presente;2026-01-01T10:00:00.000Z',
    );
    assert.equal(lines[2], ";;ativa;");
  });
});

describe("shiftRecurrence", () => {
  it("desloca por semanas", () => {
    const out = shiftRecurrence("2026-01-01T10:00:00.000Z", "semana", 2);
    assert.deepEqual(out, [
      "2026-01-08T10:00:00.000Z",
      "2026-01-15T10:00:00.000Z",
    ]);
  });

  it("desloca por meses", () => {
    const out = shiftRecurrence("2026-01-15T10:00:00.000Z", "mes", 1);
    assert.deepEqual(out, ["2026-02-15T10:00:00.000Z"]);
  });
});
