// Permite acesso ao próprio recurso ou a admins.
// Compara o :id da rota com o id do token (campo customizado `id`).
export const checkSelfOrAdmin = () => {
  return (req, res, next) => {
    const isSelf = req.userId && req.params.id === req.userId;
    const isAdmin = req.userRole === "admin";

    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        error: "Acesso negado. Você só pode acessar seu próprio perfil.",
      });
    }
    next();
  };
};
