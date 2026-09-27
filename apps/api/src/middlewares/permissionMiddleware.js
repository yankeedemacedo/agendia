export const checkRole = (...requiredRoles) => {
  return (req, res, next) => {
    const userRole = req.userRole;

    if (!userRole || !requiredRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Acesso negado. Permissões insuficientes.",
        role: userRole,
      });
    }
    next();
  };
};
