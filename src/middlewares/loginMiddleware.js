import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const loginMiddleware = (req, res, next) => {
  const token = req.cookies.token; // Pega o token puro vindo do cookie

  // 1. Verifica se o cookie com o token existe
  if (!token) {
    return res.redirect(
      "/login/?error=Sessão%20expirada%20ou%20não%20autenticada",
    );
  }

  // 2. Valida o token diretamente (sem split, sem Bearer)
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // Se o token for inválido, limpa o cookie quebrado para evitar loops
      res.clearCookie("token");
      return res.redirect(
        "/login/?error=Sessão%20expirada%20ou%20não%20autenticada",
      );
    }

    // Salva o ID do usuário para as próximas rotas usarem se precisarem
    req.userId = decoded.userId;
    req.userRole = decoded.userRole; // Se quiser usar controle de acesso baseado em função no futuro

    // 3. Tudo certo! Segue para a rota final (Ex: index, detalhes, etc.)
    next();
  });
};
