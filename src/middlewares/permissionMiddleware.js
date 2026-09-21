export const checkRole = (requiredRole) => {
  return (req, res, next) => {
    const userRole = req.userRole;

    if (!userRole || userRole !== requiredRole) {
      return res.status(403).json({
        message: "Acesso negado. Permissões insuficientes.",
        role: userRole,
      });
    }
    next();
  };
};
