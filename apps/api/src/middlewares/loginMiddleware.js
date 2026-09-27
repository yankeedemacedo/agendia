import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const getToken = (req) => {
  if (req.cookies?.token) return req.cookies.token;
  const header = req.headers?.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return null;
};

export const loginMiddleware = (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ error: "Não autenticado." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.clearCookie("token");
      return res.status(401).json({ error: "Sessão expirada ou inválida." });
    }

    req.userId = decoded.userId;
    req.userRole = decoded.userRole;

    next();
  });
};
