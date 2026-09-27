import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generateCheckInCode,
  buildQrPayload,
  parseQrPayload,
} from "../src/services/qrService.js";
import {
  reminderEmail,
  promotionEmail,
} from "../src/services/mailService.js";
import { renderCertificatePdf } from "../src/services/certificateService.js";

describe("qrService", () => {
  it("gera código de 8 hex maiúsculos", () => {
    assert.match(generateCheckInCode(), /^[0-9A-F]{8}$/);
  });

  it("monta e interpreta o payload (roundtrip)", () => {
    const payload = buildQrPayload("ticket-1", "AB12CD34");
    assert.equal(payload, "AGENDIA1:ticket-1:AB12CD34");
    assert.deepEqual(parseQrPayload(payload), {
      ticketId: "ticket-1",
      code: "AB12CD34",
    });
  });

  it("rejeita payloads inválidos", () => {
    assert.equal(parseQrPayload("lixo"), null);
    assert.equal(parseQrPayload("AGENDIA1:sem-codigo"), null);
    assert.equal(parseQrPayload("OUTRO:t:c0000000"), null);
    assert.equal(parseQrPayload(null), null);
  });
});

describe("mailService", () => {
  it("monta lembrete e promoção com nome do evento", () => {
    const ev = { titulo: "Aula", data: "01-01-2026", horario: "10:00", local: "Sala" };
    const usr = { nome: "Ana" };
    const lembrete = reminderEmail(ev, usr);
    assert.match(lembrete.subject, /Aula/);
    assert.match(lembrete.html, /Ana/);
    const promo = promotionEmail(ev, usr);
    assert.match(promo.subject, /Vaga liberada/);
    assert.match(promo.html, /waitlist/);
  });
});

describe("renderCertificatePdf", () => {
  it("gera um PDF válido", async () => {
    const pdf = await renderCertificatePdf({
      userName: "Ana",
      eventTitle: "Aula",
      eventDate: "01-01-2026",
      eventLocal: "Sala",
      checkInAt: new Date("2026-01-01"),
    });
    assert.ok(Buffer.isBuffer(pdf));
    assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
    assert.ok(pdf.length > 1000);
  });
});
