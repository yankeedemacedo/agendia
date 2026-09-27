import { Router } from "express";
import { getDashboard } from "../controllers/adminController.js";
import { loginMiddleware } from "../middlewares/loginMiddleware.js";
import { checkRole } from "../middlewares/permissionMiddleware.js";

const router = Router();

router.get(
  "/dashboard",
  loginMiddleware,
  checkRole("admin", "organizer"),
  getDashboard,
);

export default router;
