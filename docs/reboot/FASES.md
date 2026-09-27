# Reboot Agendia — Mapa de Fases

Reboot total: nova marca, SPA moderna consumindo a API, todas as frentes de features.
O app atual (Pug SSR em `src/`) continua funcionando até a SPA cobrir cada tela.

## Fase 0 — Fundação (concluída)
- [x] Decisão de marca registrada em `docs/reboot/MARCA.md`
- [x] Design tokens em `packages/tokens` (fonte única: CSS vars + TS)
- [x] Esqueleto da SPA em `apps/web` (Vite + React + TS, Router + Query, shell com a nova marca)
- [x] Critério de saída: `npm run build` passa em `apps/web`; `npm test` continua verde na raiz

## Fase 1 — Catálogo e conta na SPA (concluída, backfill pendente no banco real)
- [x] Backend vira API pura: aposentados `webController`/`webRoutes`/views/Pug (`GET /health`, 404 JSON, catálogo público)
- [x] `src/` → `apps/api` (monorepo `apps/*`, `packages/*` no root `package.json`); contrato em `docs/reboot/API.md`
- [x] Schema: `Event` + `categoria/tags/status/capaUrl/inicio-fim`; `Ticket` com dual-write; `GET /auth/me`, `GET /api/events/categorias`, paginação `page/limit`
- [x] SPA: auth, catálogo com busca/filtros/paginação, inscrição 1-clique, meus eventos, perfil, admin CRUD
- [ ] Migração de dados: rodar `node apps/api/scripts/backfill-tickets.js` contra o Atlas (cria Tickets + preenche `inicio`) — idempotente
- [x] Critério de saída: SPA cobre todas as telas do Pug; Pug desligado e removido

## Fase 2 — Participante (concluída)
- [x] Waitlist com promoção automática (no cancelamento + endpoint admin manual)
- [x] QR (`AGENDIA1:<ticketId>:<code>`) + check-in (página de presença do admin, idempotente)
- [x] Certificados PDF (só com presença confirmada)
- [x] Lembretes por e-mail (`scripts/send-reminders.js` + SMTP opcional com fallback)
- [x] Critério de saída: fluxo lotação→waitlist→promoção→check-in implementado e coberto por testes unitários (ponta a ponta real exige banco; rode o backfill + teste manual)

## Fase 3 — Organizador/Admin (concluída)
- [x] Papel `organizer` + propriedade (`criadoPor`, eventos legados = admin-only); cadastro público sempre `user`
- [x] Dashboard global/por evento (ocupação, presença, no-show, top 5)
- [x] Duplicar, recorrência (semana/mês, 1-12, rascunho), export CSV
- [x] Check-in/presença/waitlist liberados ao dono organizador
- [x] Testes de contrato supertest (sem banco) + CI (lint implícito via `tsc`, test, build)
- [x] Critério de saída: organizador opera sem tocar no banco
