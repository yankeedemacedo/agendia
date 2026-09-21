import express from "express";
import { login, logout } from "../controllers/authController.js";
import { loginMiddleware } from "../middlewares/loginMiddleware.js";

const router = express.Router();
router.post("/login", login);
router.get("/logout", logout);
export default router;
