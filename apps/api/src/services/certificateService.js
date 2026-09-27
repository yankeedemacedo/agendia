import PDFDocument from "pdfkit";
import { getTicketRepository } from "../repositories/ticketRepository.js";
import { getEventByIdRepository } from "../repositories/eventRepository.js";
import { getUserByIdRepository } from "../repositories/usersRepository.js";

const withStatus = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Render puro (testável sem banco)
export const renderCertificatePdf = ({
  userName,
  eventTitle,
  eventDate,
  eventLocal,
  checkInAt,
}) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ layout: "landscape", size: "A4" });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.rect(0, 0, 842, 595).fill("#131927");
    doc.fillColor("#2DD4BF").fontSize(20).text("agendia!", 60, 60);
    doc
      .fillColor("#F2F4F7")
      .fontSize(36)
      .text("Certificado de participação", 60, 130);
    doc.fontSize(20).text(`Certificamos que ${userName}`, 60, 220);
    doc
      .fontSize(16)
      .fillColor("#98A2B3")
      .text(
        `participou do evento "${eventTitle}", realizado em ${eventDate} — ${eventLocal}.`,
        60,
        260,
        { width: 720 },
      );
    doc
      .fontSize(12)
      .text(
        `Presença confirmada em ${checkInAt ? new Date(checkInAt).toLocaleDateString("pt-BR") : "—"}.`,
        60,
        500,
      );
    doc.end();
  });

// Só gera certificado para presença confirmada
export const generateCertificateService = async (eventId, userId) => {
  const [ev, usr, tick] = await Promise.all([
    getEventByIdRepository(eventId),
    getUserByIdRepository(userId),
    getTicketRepository(eventId, userId),
  ]);
  if (!ev) throw withStatus("Evento não encontrado.", 404);
  if (!usr) throw withStatus("Usuário não encontrado.", 404);
  if (!tick) throw withStatus("Inscrição não encontrada.", 404);
  if (tick.status !== "presente") {
    throw withStatus(
      "Certificado disponível após confirmação de presença.",
      409,
    );
  }
  return renderCertificatePdf({
    userName: usr.nome,
    eventTitle: ev.titulo,
    eventDate: ev.data,
    eventLocal: ev.local,
    checkInAt: tick.checkInAt,
  });
};
