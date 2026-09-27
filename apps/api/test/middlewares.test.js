import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkSelfOrAdmin } from "../src/middlewares/ownerMiddleware.js";
import { checkRole } from "../src/middlewares/permissionMiddleware.js";
import { rateLimit } from "../src/middlewares/rateLimitMiddleware.js";

const mockRes = () => {
  const res = { statusCode: null, body: null, headers: {} };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  res.render = (view, params) => {
    res.body = { view, ...params };
    return res;
  };
  res.setHeader = (k, v) => {
    res.headers[k] = v;
  };
  return res;
};

describe("checkSelfOrAdmin", () => {
  it("libera o próprio usuário", () => {
    let passed = false;
    checkSelfOrAdmin()(
      { userId: "u1", userRole: "user", params: { id: "u1" } },
      mockRes(),
      () => (passed = true),
    );
    assert.equal(passed, true);
  });

  it("libera admin em outro perfil", () => {
    let passed = false;
    checkSelfOrAdmin()(
      { userId: "admin", userRole: "admin", params: { id: "u1" } },
      mockRes(),
      () => (passed = true),
    );
    assert.equal(passed, true);
  });

  it("bloqueia terceiro com 403", () => {
    const res = mockRes();
    checkSelfOrAdmin()(
      { userId: "u2", userRole: "user", params: { id: "u1" } },
      res,
      () => assert.fail("não deveria passar"),
    );
    assert.equal(res.statusCode, 403);
  });
});

describe("checkRole", () => {
  it("responde JSON em rota /api", () => {
    const res = mockRes();
    checkRole("admin")(
      { userRole: "user", originalUrl: "/api/events", accepts: () => "json" },
      res,
      () => assert.fail("não deveria passar"),
    );
    assert.equal(res.statusCode, 403);
    assert.match(res.body.message, /Acesso negado/);
  });

  it("responde JSON 403 também em rota web (API-only)", () => {
    const res = mockRes();
    checkRole("admin")(
      {
        userRole: "user",
        originalUrl: "/admin/eventos",
        accepts: () => "html",
      },
      res,
      () => assert.fail("não deveria passar"),
    );
    assert.equal(res.statusCode, 403);
    assert.match(res.body.message, /Acesso negado/);
  });
});

describe("rateLimit", () => {
  it("bloqueia após o máximo com 429", () => {
    const limiter = rateLimit({ windowMs: 60_000, max: 2 });
    const req = { ip: "127.0.0.1-test" };
    let passed = 0;
    const next = () => (passed += 1);

    limiter(req, mockRes(), next);
    limiter(req, mockRes(), next);
    const res = mockRes();
    limiter(req, res, next);

    assert.equal(passed, 2);
    assert.equal(res.statusCode, 429);
  });
});
