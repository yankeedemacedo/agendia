import express from "express";
import {
  getEventsWeb,
  getEventDetailsWeb,
  getMyEventsWeb,
  loginPage,
  registerPage,
  createEventPage,
  adminEventsPage,
  editEventPage,
  userPage,
} from "../controllers/webController.js";
import { loginMiddleware } from "../middlewares/loginMiddleware.js";
import { checkRole } from "../middlewares/permissionMiddleware.js";

const router = express.Router();
router.get("/", loginMiddleware, getEventsWeb);
router.get("/event/:search", loginMiddleware, getEventsWeb);
router.get("/events/:id", loginMiddleware, getEventDetailsWeb);
router.get("/meus-eventos", loginMiddleware, getMyEventsWeb);
router.get("/login", loginPage);
router.get("/cadastro", registerPage);
router.get("/perfil", loginMiddleware, userPage); // Página de perfil (pode ser editada depois para mostrar detalhes do usuário)
///admin
router.get(
  "/admin/criar-evento",
  loginMiddleware,
  checkRole("admin"),
  createEventPage,
);
router.get(
  "/admin/eventos",
  loginMiddleware,
  checkRole("admin"),
  adminEventsPage,
);
router.get(
  "/admin/editar-evento/:id",
  loginMiddleware,
  checkRole("admin"),
  editEventPage,
);

export default router;
