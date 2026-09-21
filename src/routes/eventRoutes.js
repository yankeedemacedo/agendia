import { Router } from "express";
import {
  getEvents,
  getEventbyName,
  getEventById,
  createEvent,
  parcialUpdateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import {
  eventCreateValidationRules,
  eventUpdateValidationRules,
} from "../validators/eventValidator.js";
import validate from "../middlewares/validatorMiddleware.js";
import { loginMiddleware } from "../middlewares/loginMiddleware.js";
import { checkRole } from "../middlewares/permissionMiddleware.js";

const router = Router();

router.get("/", loginMiddleware, getEvents);
router.get("/search/:name", loginMiddleware, getEventbyName);
router.get("/:id", loginMiddleware, getEventById);
router.post(
  "/",
  loginMiddleware,
  checkRole("admin"),
  eventCreateValidationRules,
  validate,
  createEvent,
);
router.patch(
  "/:id",
  loginMiddleware,
  checkRole("admin"),
  eventUpdateValidationRules,
  validate,
  parcialUpdateEvent,
);
router.delete("/:id", loginMiddleware, checkRole("admin"), deleteEvent);

export default router;
