import event from "../models/eventSchema.js";

// Decisão pura (testável): admin tudo; organizador só no próprio evento
// (legados sem dono = só admin); demais papéis nunca.
export const canOperateEvent = ({ userRole, userId, criadoPor }) => {
  if (userRole === "admin") return true;
  if (userRole !== "organizer") return false;
  return Boolean(criadoPor) && criadoPor === userId;
};

// Admin passa tudo; organizador só opera evento próprio (criadoPor = seu id).
// Eventos legados (criadoPor nulo) são exclusivos do admin.
export const checkEventOwnerOrAdmin = () => {
  return async (req, res, next) => {
    if (req.userRole === "admin") return next();
    if (req.userRole !== "organizer") {
      return res.status(403).json({
        message: "Acesso negado. Permissões insuficientes.",
      });
    }
    const found = await event.findOne({ id: req.params.id });
    if (!found) return res.status(404).json({ error: "Evento não encontrado." });
    if (!canOperateEvent({ userRole: req.userRole, userId: req.userId, criadoPor: found.criadoPor })) {
      return res.status(403).json({
        message: "Acesso negado. Este evento é de outro organizador.",
      });
    }
    next();
  };
};
