// CORS cross-origin sem banco: preflight e headers com FRONTEND_URL fixo
// antes de importar o app (evita corrida com o dotenv).
import { describe, it } from "node:test";
import assert from "node:assert/strict";

process.env.MONGO_URI ??= "mongodb://127.0.0.1:27017/agendia-test";
process.env.JWT_SECRET ??= "segredo-de-teste";
process.env.FRONTEND_URL ??= "https://front-teste.local";

const { default: app } = await import("../src/app.js");
const { default: request } = await import("supertest");

describe("CORS", () => {
  it("reflete origin permitida com credentials", async () => {
    const res = await request(app)
      .get("/health")
      .set("Origin", "https://front-teste.local");
    assert.equal(
      res.headers["access-control-allow-origin"],
      "https://front-teste.local",
    );
    assert.equal(res.headers["access-control-allow-credentials"], "true");
  });

  it("não reflete origin desconhecida", async () => {
    const res = await request(app)
      .get("/health")
      .set("Origin", "https://evil.local");
    assert.equal(res.headers["access-control-allow-origin"], undefined);
  });

  it("responde preflight OPTIONS", async () => {
    const res = await request(app)
      .options("/api/events")
      .set("Origin", "https://front-teste.local")
      .set("Access-Control-Request-Method", "GET");
    assert.ok([200, 204].includes(res.status));
  });
});
