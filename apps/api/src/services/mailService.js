import nodemailer from "nodemailer";

let transporter = null;

export const isMailConfigured = () =>
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS,
  );

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

// Best-effort: sem SMTP configurado só registra e segue (dev local)
export const sendMail = async ({ to, subject, html }) => {
  if (!isMailConfigured()) {
    console.warn(`[mail] SMTP não configurado — e-mail para ${to} ignorado: ${subject}`);
    return { skipped: true };
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  await getTransporter().sendMail({ from, to, subject, html });
  return { skipped: false };
};

export const reminderEmail = (event, user) => ({
  subject: `Lembrete: ${event.titulo} é amanhã!`,
  html: `<p>Olá, ${user.nome}!</p><p>Seu evento <strong>${event.titulo}</strong> acontece em <strong>${event.data} às ${event.horario}</strong> (${event.local}).</p><p>Até lá! — agendia!</p>`,
});

export const promotionEmail = (event, user) => ({
  subject: `Vaga liberada: ${event.titulo}`,
  html: `<p>Olá, ${user.nome}!</p><p>Uma vaga liberou e você saiu da waitlist do evento <strong>${event.titulo}</strong> (${event.data} às ${event.horario}). Sua inscrição está confirmada!</p><p>Até lá! — agendia!</p>`,
});
