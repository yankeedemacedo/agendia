import jwt from "jsonwebtoken";

const JWT_SECRET = "sua-chave-super-secreta-e-longa-12345";

export const userLocalMiddleware = (req, res, next) => {
  const token = req.cookies ? req.cookies.token : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.locals.user = {
        id: decoded.userId,
        name: decoded.name,
        role: decoded.userRole || "user",
      };
    } catch (err) {
      res.clearCookie("token");
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }

  next();
};
