import { Router } from "express";
import {
  createParticipant,
  deleteParticipant,
  joinWaitlist,
  leaveWaitlist,
  getWaitlistPosition,
  listWaitlist,
  promoteWaitlist,
  getMyTicket,
  getCertificate,
  listAttendees,
  checkIn,
} from "../controllers/participantController.js";
import { loginMiddleware } from "../middlewares/loginMiddleware.js";
import { checkRole } from "../middlewares/permissionMiddleware.js";
import { checkEventOwnerOrAdmin } from "../middlewares/eventOwnerMiddleware.js";

const router = Router();

// Check-in antes de `/:id` para não ser capturado como id="checkin"
router.post(
  "/checkin",
  loginMiddleware,
  checkRole("admin", "organizer"),
  checkIn,
);

router.post("/:id", loginMiddleware, createParticipant);
router.delete("/:id", loginMiddleware, deleteParticipant);

// Waitlist do participante
router.post("/:id/waitlist", loginMiddleware, joinWaitlist);
router.delete("/:id/waitlist", loginMiddleware, leaveWaitlist);
router.get("/:id/waitlist/posicao", loginMiddleware, getWaitlistPosition);

// Ingresso e certificado do participante
router.get("/:id/ticket", loginMiddleware, getMyTicket);
router.get("/:id/certificado", loginMiddleware, getCertificate);

// Operação do evento (admin ou organizador dono)
router.get(
  "/:id/waitlist",
  loginMiddleware,
  checkRole("admin", "organizer"),
  checkEventOwnerOrAdmin(),
  listWaitlist,
);
router.post(
  "/:id/waitlist/promover",
  loginMiddleware,
  checkRole("admin", "organizer"),
  checkEventOwnerOrAdmin(),
  promoteWaitlist,
);
router.get(
  "/:id/attendees",
  loginMiddleware,
  checkRole("admin", "organizer"),
  checkEventOwnerOrAdmin(),
  listAttendees,
);

export default router;
