import "./config/env.js";
import express from "express";
import eventRoutes from "./routes/eventRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import participantRoutes from "./routes/participantRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import logInfomations from "./middlewares/logMiddleware.js";
import { globalErrorHandler } from "./middlewares/errorMiddleware.js";
import { securityHeaders } from "./middlewares/securityMiddleware.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(securityHeaders);
app.use(logInfomations);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/events", eventRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/admin", adminRoutes);
app.use("/auth", authRoutes);

app.use((req, res) => res.status(404).json({ error: "Rota não encontrada." }));
app.use(globalErrorHandler);

export default app;
