# Contrato da API (Fase 1)

Base: mesma origem da SPA (proxy do Vite) ou `VITE_API_URL`. Sessão via cookie
HttpOnly `token` (1h) ou `Authorization: Bearer`. Catálogo é **público**;
inscrição e perfil exigem login; administração exige `admin`.

## Auth — `/auth`
| Método | Rota      | Auth | Corpo              | Resposta                          |
| ------ | --------- | ---- | ------------------ | --------------------------------- |
| POST   | `/login`  | —    | `{email, password}` | `{success, redirectTo, user}`    |
| GET    | `/logout` | —    | —                  | redirect                          |
| GET    | `/me`     | sim  | —                  | `User` (restaura sessão da SPA)   |

Erros: `401 {error}` sem token / token inválido.

## Eventos — `/api/events`
- `GET /` público. Query: `search`, `categoria`, `status`, `page` (default 1), `limit` (default 12, máx 50).
  - Sem `page`/`limit`: retorna lista `Event[]` (legado).
  - Com paginação: `{data, page, limit, total, totalPages}`.
- `GET /mine` login → próprios eventos (organizador) ou todos (admin).
- `GET /categorias` → `string[]` (para filtros da SPA).
- `GET /stats` público → `{eventos, inscritos, vagasLivres, categorias}` (hero da home).
- `GET /search/:name` → `Event[]`.
- `GET /:id` → `Event` (404 via `next(error)`).
- `POST /` organizador/admin. Dono = criador (`criadoPor` automático, ignorado no corpo).
- `PATCH /:id`, `DELETE /:id` admin ou organizador dono (legados sem dono = só admin).
- `POST /:id/duplicar` admin/dono → cópia em `rascunho` sem inscritos.
- `POST /:id/recorrencia` admin/dono `{aCada: semana|mes, vezes: 1-12}` → cópias em rascunho (base precisa de `inicio`).
- `GET /:id/dashboard` admin/dono → `{event, stats}`.
- `GET /:id/export` admin/dono → CSV de participantes.

`Event`: `{id, titulo, descricao, data, horario, local, acesso, vagas, categoria, tags, status, capaUrl, inicio, fim, criadoPor, participantes[]}`.

## Admin — `/api/admin`
- `GET /dashboard` organizador/admin → `{resumo, top[5], eventos[]}` com `stats {vagas, inscritos, presentes, ausentes, waitlist, ocupacao%, taxaPresenca%}` (organizador vê só os seus; admin pode filtrar `?criadoPor=`).
- Papel `organizer`: cria eventos e opera os próprios (presença, waitlist, check-in, export, dashboard); `GET /api/users` e gestão de papéis seguem admin-only. Cadastro público sempre cria `user` (`papel` do corpo é ignorado).

## Usuários — `/api/users`
- `GET /` admin. `GET /search/:name` login. `GET /:id` próprio ou admin.
- `POST /` aberto (cadastro): `{nome, email, senha≥6, telefone 11d, cpf 11d, dataNascimento}` → `201 {message, user}`. Duplicata CPF/email → 409.
- `PATCH /:id` próprio ou admin: requer `senhaAtual`; `novaSenha`→`senha` tratado no controller; `papel` só via admin.
- `DELETE /:id` próprio ou admin: requer `senhaAtual`; limpa inscrições + tickets.

`User`: `{id, nome, email, telefone, dataNascimento, papel, eventos[]}` (nunca `senha`/`cpf`).

## Inscrições — `/api/participants`
- `POST /:eventId` login → `201 {message, participant}`. Lotado → 409 com `action: "waitlist"`, duplicada → 409, inexistente → 404. Gera `Ticket` (dual-write com os arrays).
- `DELETE /:eventId` login → remove inscrição + ticket; promove o 1º da waitlist (resposta inclui `promoted`).
- `POST /:eventId/waitlist` login → `201 {message, waitlist: {position}}`. Com vagas livres → 400 com `action: "subscribe"`.
- `DELETE /:eventId/waitlist` login → sai da fila.
- `GET /:eventId/waitlist/posicao` login → `{eventId, position}` (404 se fora da fila).
- `GET /:eventId/ticket` login → ingresso `{id, eventId, status, checkInCode, checkInAt, qr}` (`qr` = `AGENDIA1:<ticketId>:<code>`).
- `GET /:eventId/certificado` login → PDF (só com presença confirmada, senão 409; admin pode passar `?userId=`).
- `GET /:eventId/waitlist` admin → fila com usuários. `POST /:eventId/waitlist/promover` admin → promove o 1º.
- `GET /:eventId/attendees` admin → tickets + `{id, nome, email}`.
- `POST /checkin` admin → `{qr}` ou `{ticketId, code}` → confirma presença (idempotente).

## Minhas inscrições
Via `GET /api/users/:id` (campo `eventos[]`) + `GET /api/events/:id` por item. Ingresso e certificado em `/api/participants/:eventId/ticket` e `/certificado`.

## E-mail (Fase 2)
`SMTP_*` no `.env` (ver `.env.example`). Sem SMTP o envio é ignorado com aviso. Lembretes (eventos com `inicio` nas próximas 24h): `node apps/api/scripts/send-reminders.js` via cron diário. Promoção da waitlist notifica best-effort.

## Seed (banco de teste)
`node apps/api/scripts/seed.js` apaga e recria usuários/eventos/tickets/waitlist com dados variados (12 eventos, 1 lotado com waitlist, 1 rascunho, 1 encerrado, 1 presença confirmada). Logins: `admin@agendia.test`, `org@agendia.test`, `ana@agendia.test` — senha `senha123`.
