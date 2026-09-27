import {
  createParticipantService,
  deleteParticipantService,
} from "../services/participantService.js";
import {
  joinWaitlistService,
  leaveWaitlistService,
  getWaitlistPositionService,
  promoteFromWaitlistService,
} from "../services/waitlistService.js";
import {
  getTicketRepository,
  listTicketsByEventRepository,
  checkInTicketRepository,
} from "../repositories/ticketRepository.js";
import { listWaitlistByEventRepository } from "../repositories/waitlistRepository.js";
import { generateCertificateService } from "../services/certificateService.js";
import { buildQrPayload } from "../services/qrService.js";

export const createParticipant = async (req, res, next) => {
  try {
    const participantId = req.userId;
    const eventId = req.params.id;
    const participant = await createParticipantService(eventId, participantId);
    res
      .status(201)
      .json({ message: "Participação registrada com sucesso", participant });
  } catch (error) {
    // Evento lotado: indica a waitlist como caminho
    if (error.statusCode === 409 && /lotado/i.test(error.message)) {
      error.action = "waitlist";
    }
    next(error);
  }
};

export const deleteParticipant = async (req, res, next) => {
  try {
    const eventId = req.params.id; // Supondo que o ID do evento seja enviado como parâmetro da rota
    const participantId = req.userId; // Supondo que o ID do participante seja obtido do token de autenticação
    const { promoted } = await deleteParticipantService(eventId, participantId);
    res.json({
      message: promoted
        ? "Participação removida; primeiro da waitlist promovido."
        : "Participação removida com sucesso",
      promoted,
    });
  } catch (error) {
    next(error);
  }
};

export const joinWaitlist = async (req, res, next) => {
  try {
    const entry = await joinWaitlistService(req.params.id, req.userId);
    res.status(201).json({
      message: "Você entrou na waitlist!",
      waitlist: entry,
    });
  } catch (error) {
    next(error);
  }
};

export const leaveWaitlist = async (req, res, next) => {
  try {
    const result = await leaveWaitlistService(req.params.id, req.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getWaitlistPosition = async (req, res, next) => {
  try {
    const position = await getWaitlistPositionService(
      req.params.id,
      req.userId,
    );
    res.json(position);
  } catch (error) {
    next(error);
  }
};

export const listWaitlist = async (req, res, next) => {
  try {
    const list = await listWaitlistByEventRepository(req.params.id);
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const promoteWaitlist = async (req, res, next) => {
  try {
    const promoted = await promoteFromWaitlistService(req.params.id);
    if (!promoted) {
      return res.status(404).json({ error: "Waitlist vazia ou sem vagas." });
    }
    res.json({ message: "Primeiro da waitlist promovido.", promoted });
  } catch (error) {
    next(error);
  }
};

export const getMyTicket = async (req, res, next) => {
  try {
    const ticket = await getTicketRepository(req.params.id, req.userId);
    if (!ticket) {
      return res.status(404).json({ error: "Inscrição não encontrada." });
    }
    res.json({
      ...ticket,
      qr: buildQrPayload(ticket.id, ticket.checkInCode),
    });
  } catch (error) {
    next(error);
  }
};

export const getCertificate = async (req, res, next) => {
  try {
    const targetUserId =
      req.userRole === "admin" && req.query.userId
        ? req.query.userId
        : req.userId;
    const pdf = await generateCertificateService(req.params.id, targetUserId);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="certificado-${req.params.id}.pdf"`,
    );
    res.send(pdf);
  } catch (error) {
    next(error);
  }
};

export const listAttendees = async (req, res, next) => {
  try {
    const attendees = await listTicketsByEventRepository(req.params.id);
    res.json(attendees);
  } catch (error) {
    next(error);
  }
};

export const checkIn = async (req, res, next) => {
  try {
    const result = await checkInTicketRepository({
      qr: req.body?.qr,
      ticketId: req.body?.ticketId,
      code: req.body?.code,
      requester: { userId: req.userId, userRole: req.userRole },
    });
    res.json({
      message: result.already
        ? "Presença já confirmada anteriormente."
        : "Presença confirmada!",
      ticket: result,
    });
  } catch (error) {
    next(error);
  }
};
