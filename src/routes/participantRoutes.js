import { Router } from "express";
import {
  createParticipant,
  deleteParticipant,
} from "../controllers/participantController.js";
import { loginMiddleware } from "../middlewares/loginMiddleware.js";

const router = Router();

router.post("/:id", loginMiddleware, createParticipant);
router.delete("/:id", loginMiddleware, deleteParticipant);

export default router;
