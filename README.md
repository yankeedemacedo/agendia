# 📅 agendia!

Plataforma de eventos: catálogo público, inscrição em 1-clique, waitlist com promoção automática, ingresso com QR, check-in, certificados e painel do organizador — com nova identidade tech dark.

## ✨ O que dá para fazer

| Perfil | Fluxos |
|---|---|
| Visitante | Explorar catálogo com busca, categoria e paginação; ver detalhes e vagas |
| Participante | Inscrever-se em 1-clique, entrar na waitlist de lotados, ver ingresso com QR, baixar certificado após presença |
| Organizador | Criar/editar/duplicar eventos, recorrência, presença com leitor de QR, waitlist, export CSV, dashboard próprio |
| Admin | Tudo acima + qualquer evento, todos os usuários, dashboard global |

## 🛠️ Tecnologias

- **API**: Node.js 18, Express 5, Mongoose 7 + MongoDB Atlas, JWT em cookie HttpOnly (com `Bearer`), `express-validator`, pdfkit (certificados), nodemailer (e-mails), supertest (contrato)
- **Web**: Vite 5, React 18 + TypeScript, React Router, TanStack Query, `qrcode.react` (QR), `@zxing/browser` (leitor, lazy chunk), design tokens próprios (`packages/tokens`)
- **Qualidade**: `node --test`, `tsc`, GitHub Actions (test + build)

## ▶️ Passo a passo

### 1. Pré-requisitos
- Node.js 18+ e npm
- Um cluster MongoDB Atlas (ou qualquer Mongo acessível) + credenciais SMTP opcionais (lembretes)

### 2. Baixar e instalar
```bash
git clone https://github.com/yankeemauricio/agendia.git
cd agendia
npm install
cp .env.example .env   # e preencha (nunca commite o .env)
```

### 3. Configurar o `.env`
```ini
MONGO_URI="mongodb+srv://<usuario>:<senha>@<cluster>/?appName=Agendia"
PORT="3000"
JWT_SECRET="troque-por-uma-string-longa-e-aleatoria"
# Opcional (Fase 2): SMTP_HOST/PORT/USER/PASS/FROM para lembretes e avisos
```

### 4. Popular o banco de teste
```bash
node apps/api/scripts/seed.js --events 60
```
Apaga e recria tudo de forma determinística. Logins (senha `senha123`): `admin@agendia.test` (admin), `org@agendia.test` (organizer), `ana@agendia.test` (user).

### 5. Rodar
```bash
npm run dev:api   # API em http://localhost:3000
npm run dev:web   # SPA em http://localhost:5173 (proxy /api → :3000)
```
Produção: `npm run start:api` e `npm run build:web` (`apps/web/dist` estático).

## 📜 Scripts
| Comando | O que faz |
|---|---|
| `npm test` | Testes da API (sem banco) |
| `npm run build:web` | Build da SPA (`tsc` + Vite) |
| `node apps/api/scripts/seed.js [--events N]` | Popula o banco de teste |
| `node apps/api/scripts/backfill-tickets.js` | Migra inscrições legadas p/ Tickets (+`inicio`, códigos) |
| `node apps/api/scripts/send-reminders.js` | E-mails de eventos nas próximas 24h (agende via cron) |

## 🏗️ Arquitetura

Monorepo: `apps/api` (Express, API JSON pura) + `apps/web` (SPA) + `packages/tokens` (design system). Camadas da API: `routes → middlewares → controllers → services → repositories → models`. Contrato completo em `docs/reboot/API.md`; fases em `docs/reboot/FASES.md`.

Modelo: `id` customizado (UUID) ao lado do `_id`; inscrições em `Ticket` (índice único) com dual-write nos arrays; `Waitlist` com promoção automática ao liberar vaga.

## 🚀 Deploy (resumo)
- **API**: qualquer host Node (`npm run start:api`) com `MONGO_URI`/`JWT_SECRET`/`NODE_ENV=production` (cookie vira `secure`)
- **Web**: `dist/` estático (Vercel/Netlify/Nginx) com `VITE_API_URL` apontando p/ API
- **Cron**: `send-reminders.js` diário; **câmera do leitor QR exige HTTPS** (ou localhost)

## 🆘 Problemas comuns
- `❌ Variáveis de ambiente obrigatórias ausentes` → crie/preencha o `.env` na raiz (o loader ancora na raiz sozinho)
- Catálogo vazio → rode o seed; eventos legados sem `status` já são incluídos pelo filtro
- E-mail não chega → sem `SMTP_*` o envio é ignorado com aviso no log (by design)
- Câmera não abre → confira HTTPS e permissão do navegador; use a digitação manual do código
