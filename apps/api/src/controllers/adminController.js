import { getGlobalDashboardService } from "../services/dashboardService.js";

export const getDashboard = async (req, res, next) => {
  try {
    // Admin pode filtrar por organizador (?criadoPor=); organizador vê só o seu
    const criadoPor =
      req.userRole === "admin" ? req.query.criadoPor : req.userId;
    const dashboard = await getGlobalDashboardService({ criadoPor });
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};
