import express from "express";
import dotenv from "dotenv";
import eventRoutes from "./routes/eventRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import participantRoutes from "./routes/participantRoutes.js";
import logInfomations from "./middlewares/logMiddleware.js";
import { globalErrorHandler } from "./middlewares/errorMiddleware.js";
import webRoutes from "./routes/webRoutes.js";
import { fileURLToPath } from "url";
import path from "path";
import cookieParser from "cookie-parser";
import { userLocalMiddleware } from "./middlewares/userLocalMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config();

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(cookieParser());
app.use(userLocalMiddleware);
app.use(logInfomations);
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use("/api/events", eventRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/participants", participantRoutes);
app.use("/auth", authRoutes);
app.use("/", webRoutes);

app.use(globalErrorHandler);

export default app;
