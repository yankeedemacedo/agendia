import express from "express";
import { login, logout, me } from "../controllers/authController.js";
import { loginMiddleware } from "../middlewares/loginMiddleware.js";
import { rateLimit } from "../middlewares/rateLimitMiddleware.js";

const router = express.Router();
router.post("/login", rateLimit({ max: 20 }), login);
router.get("/logout", logout);
router.get("/me", loginMiddleware, me);
export default router;
