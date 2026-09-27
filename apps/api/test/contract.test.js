// Testes de contrato HTTP sem banco: saúde, 404 e validações que
// rejeitam antes de qualquer query.
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Fixa env antes de importar o app (evita corrida com o dotenv)
process.env.MONGO_URI ??= "mongodb://127.0.0.1:27017/agendia-test";
process.env.JWT_SECRET ??= "segredo-de-teste";

const { default: app } = await import("../src/app.js");
const { default: request } = await import("supertest");

describe("contrato HTTP", () => {
  it("GET /health responde ok", async () => {
    const res = await request(app).get("/health");
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: "ok" });
  });

  it("rota desconhecida retorna 404 JSON", async () => {
    const res = await request(app).get("/api/nao-existe");
    assert.equal(res.status, 404);
    assert.equal(res.body.error, "Rota não encontrada.");
  });

  it("POST /auth/login sem corpo retorna 400", async () => {
    const res = await request(app).post("/auth/login").send({});
    assert.equal(res.status, 400);
  });

  it("POST /api/users sem corpo retorna 400 de validação", async () => {
    const res = await request(app).post("/api/users/").send({});
    assert.equal(res.status, 400);
    assert.ok(Array.isArray(res.body.errors));
  });
});
