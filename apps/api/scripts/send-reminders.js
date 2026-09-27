// Lembretes Fase 2: e-mail para inscritos em eventos que começam em ~24h.
//
// Uso: node apps/api/scripts/send-reminders.js (agende via cron diário)
// Requer SMTP_* no .env; sem SMTP, só registra e sai.

import mongoose from "mongoose";
import "../src/config/env.js";
import { MONGO_URI } from "../src/config/env.js";
import event from "../src/models/eventSchema.js";
import user from "../src/models/userSchema.js";
import { sendMail, isMailConfigured, reminderEmail } from "../src/services/mailService.js";

if (!isMailConfigured()) {
  console.warn("[reminders] SMTP não configurado — nada será enviado.");
  process.exit(0);
}

await mongoose.connect(MONGO_URI, { dbName: "agendia" });

const now = new Date();
const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

const upcoming = await event.find({
  status: "publicado",
  inicio: { $gte: now, $lte: in24h },
});

let enviados = 0;
for (const ev of upcoming) {
  if (!ev.participantes?.length) continue;
  const users = await user.find({ id: { $in: ev.participantes } });
  for (const u of users) {
    try {
      await sendMail({ to: u.email, ...reminderEmail(ev, u) });
      enviados += 1;
    } catch (error) {
      console.error(`[reminders] falha para ${u.email}: ${error.message}`);
    }
  }
}

console.log(`[reminders] ${enviados} lembretes enviados (${upcoming.length} eventos).`);
await mongoose.disconnect();
