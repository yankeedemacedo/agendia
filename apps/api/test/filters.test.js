import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseEventFilters,
  buildEventFilter,
} from "../src/repositories/eventRepository.js";

describe("buildEventFilter", () => {
  it("inclui legados sem campo no filtro de status/categoria", () => {
    assert.deepEqual(buildEventFilter({ status: "publicado" }), {
      status: { $in: ["publicado", null, ""] },
    });
    assert.deepEqual(buildEventFilter({ categoria: "Tech" }), {
      categoria: { $in: ["Tech", null, ""] },
    });
  });
});

describe("parseEventFilters", () => {
  it("aplica defaults (page 1, limit 12)", () => {
    assert.deepEqual(parseEventFilters({}), {
      search: "",
      categoria: "",
      status: "",
      criadoPor: "",
      page: 1,
      limit: 12,
    });
  });

  it("limita o page size a 50 e normaliza página mínima", () => {
    const f = parseEventFilters({ page: "0", limit: "999" });
    assert.equal(f.page, 1);
    assert.equal(f.limit, 50);
  });

  it("aparaf strings e ignora não-strings", () => {
    const f = parseEventFilters({
      search: "  aula ",
      categoria: 42,
      status: "publicado",
    });
    assert.equal(f.search, "aula");
    assert.equal(f.categoria, "");
    assert.equal(f.status, "publicado");
  });
});
