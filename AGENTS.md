# AGENTS.md

## Commands
- API: `npm run dev:api` / `npm run start:api` (ou `npm run dev` dentro de `apps/api`, entry `src/server.js`). `npm test` na raiz roda os testes da API (`node --test`, sem DB).
- SPA: `npm run dev:web` / `npm run build:web` (ou dentro de `apps/web`; proxy `/api` e `/auth` → `localhost:3000` no dev).
- Requires live MongoDB Atlas; no seeded DB or fixtures. `apps/api/src/config/env.js` fail-fasts quando `MONGO_URI`/`JWT_SECRET` faltam; `PORT` defaults to 3000.
- Run API commands from repo root or `apps/api/`; web commands from `apps/web/`.

## Env
- Copy `.env.example` to `.env` (gitignored, never commit): `MONGO_URI` (com `dbName: "agendia"` no código), `PORT`, `JWT_SECRET`, `NODE_ENV`. SPA usa `apps/web/.env` com `VITE_API_URL` (vazio = mesma origem).
- All JWT sign/verify uses `process.env.JWT_SECRET`. Cookie is `secure` only when `NODE_ENV=production`.

## Architecture
- Monorepo ESM: `apps/api` (Express 5, API JSON pura — sem SSR), `apps/web` (Vite + React + TS, Router + React Query), `packages/tokens` (design tokens). Fases do reboot em `docs/reboot/FASES.md`, contrato da API em `docs/reboot/API.md`.
- API layer order: `routes/` → `middlewares/` → `controllers/` → `services/` → `repositories/` → `models/` (Mongoose). Shape output in `dtos/`, validate input with `express-validator` rules in `validators/` + `middlewares/validatorMiddleware.js`. Mount table em `apps/api/src/app.js` (+ `GET /health`, 404 JSON).
- Auth: JWT (1h) em cookie HttpOnly `token`, também aceito como `Authorization: Bearer`. `GET /auth/me` restaura a sessão da SPA. `checkSelfOrAdmin()` guarda `/api/users/:id`; `GET /api/users` é admin-only. Papéis: `user` < `organizer` (cria e opera os próprios eventos via `criadoPor`) < `admin` (tudo; eventos legados sem dono). Rate limit in-memory em login/cadastro (por processo).
- Errors: `globalErrorHandler` sempre JSON via `error.statusCode`.
- SPA: `src/lib/api.ts` (fetch com `credentials: include`), `src/auth/AuthContext.tsx`, guards em `src/components/Guards.tsx` (`RequireAuth`, `RequireAdmin`, `RequireOrganizer`), páginas em `src/pages/` (inclui `Dashboard`, `Attendees`, `TicketPage`).

## Conventions
- Custom string `id` (`randomUUID()`) ao lado do `_id`; sempre consultar por `{ id }`, nunca `findById`. Refs String (`user.eventos` → `ref: "events"`, `event.participantes` → `ref: "users"`).
- Campos de schema/model em PT-BR (`nome`, `senha`, `papel`, `titulo`, `vagas`) — manter, não traduzir.
- DTOs são allow-lists explícitas: `eventDTO` exclui `_id`/`__v`; `usersDTO` nunca retorna `senha`/`cpf` e defaulta `eventos` para `[]`.
- `data` = 10 chars `DD-MM-YYYY`, `horario` = 5 chars `HH:mm`; `senha` mín. 6; updates de perfil exigem `senhaAtual`, e `novaSenha` (form web) é mapeada para `senha` no controller.
- Inscrições só pelas rotas de participante (check atômico de vagas via `$expr` + `Ticket` com índice único; arrays mantidos em dual-write). Lotado retorna `action: "waitlist"`; waitlist com vagas livres retorna `action: "subscribe"`. Cancelamento promove o 1º da fila (best-effort + e-mail). PATCH de eventos/usuários remove `participantes`/`senhaAtual`/`papel` (não-admin) antes do `$set`. Delete de usuário/evento limpa refs órfãs + tickets.
- Ticket: `{id, eventId, userId, status: ativa|presente|cancelada, checkInCode, checkInAt}`; QR = `AGENDIA1:<ticketId>:<code>` (`qrService`, check-in idempotente via `POST /api/participants/checkin`). Certificado PDF só com presença (`certificateService`). E-mail via `mailService` (SMTP opcional); lembretes em `apps/api/scripts/send-reminders.js`.
- Lista de eventos: sem `page`/`limit` retorna array legado; com paginação retorna `{data, page, limit, total, totalPages}` (`parseEventFilters`, limit máx. 50). Filtros `status`/`categoria` incluem documentos legados sem o campo (`$in` com `null`).
- Seed de teste em `apps/api/scripts/seed.js` (apaga e recria tudo; senha `senha123`).
- SPA é dark-only violeta editorial (Anton + Inter + JetBrains Mono): tokens em `packages/tokens/tokens.css`, home com hero/stats/cards numerados/manifesto/footer, hamburger <900px, tabelas com scroll horizontal.
