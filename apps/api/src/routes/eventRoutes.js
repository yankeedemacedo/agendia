import { Router } from "express";
import {
  getEvents,
  getMyEvents,
  getEventCategories,
  getPublicStats,
  getEventbyName,
  getEventById,
  createEvent,
  parcialUpdateEvent,
  deleteEvent,
  duplicateEvent,
  createRecurrence,
  getEventDashboard,
  exportAttendees,
} from "../controllers/eventController.js";
import {
  eventCreateValidationRules,
  eventUpdateValidationRules,
  eventRecurrenceValidationRules,
} from "../validators/eventValidator.js";
import validate from "../middlewares/validatorMiddleware.js";
import { loginMiddleware } from "../middlewares/loginMiddleware.js";
import { checkRole } from "../middlewares/permissionMiddleware.js";
import { checkEventOwnerOrAdmin } from "../middlewares/eventOwnerMiddleware.js";

const router = Router();

router.get("/", getEvents);
router.get("/mine", loginMiddleware, getMyEvents);
router.get("/categorias", getEventCategories);
router.get("/stats", getPublicStats);
router.get("/search/:name", getEventbyName);
router.get("/:id", getEventById);
router.post(
  "/",
  loginMiddleware,
  checkRole("admin", "organizer"),
  eventCreateValidationRules,
  validate,
  createEvent,
);
router.patch(
  "/:id",
  loginMiddleware,
  checkRole("admin", "organizer"),
  checkEventOwnerOrAdmin(),
  eventUpdateValidationRules,
  validate,
  parcialUpdateEvent,
);
router.delete(
  "/:id",
  loginMiddleware,
  checkRole("admin", "organizer"),
  checkEventOwnerOrAdmin(),
  deleteEvent,
);
router.post(
  "/:id/duplicar",
  loginMiddleware,
  checkRole("admin", "organizer"),
  checkEventOwnerOrAdmin(),
  duplicateEvent,
);
router.post(
  "/:id/recorrencia",
  loginMiddleware,
  checkRole("admin", "organizer"),
  checkEventOwnerOrAdmin(),
  eventRecurrenceValidationRules,
  validate,
  createRecurrence,
);
router.get(
  "/:id/dashboard",
  loginMiddleware,
  checkRole("admin", "organizer"),
  checkEventOwnerOrAdmin(),
  getEventDashboard,
);
router.get(
  "/:id/export",
  loginMiddleware,
  checkRole("admin", "organizer"),
  checkEventOwnerOrAdmin(),
  exportAttendees,
);

export default router;
