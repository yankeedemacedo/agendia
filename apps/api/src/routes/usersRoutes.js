import { Router } from "express";
import {
  getUsers,
  getUserbyName,
  getUserById,
  registerUser,
  partialUpdateUser,
  deleteUser,
} from "../controllers/usersController.js";
import {
  registerUserValidationRules,
  partialUpdateUserValidationRules,
} from "../validators/usersValidator.js";
import validate from "../middlewares/validatorMiddleware.js";
import { loginMiddleware } from "../middlewares/loginMiddleware.js";
import { checkRole } from "../middlewares/permissionMiddleware.js";
import { checkSelfOrAdmin } from "../middlewares/ownerMiddleware.js";
import { rateLimit } from "../middlewares/rateLimitMiddleware.js";

const router = Router();

router.get("/", loginMiddleware, checkRole("admin"), getUsers);
router.get("/search/:name", loginMiddleware, getUserbyName); //autenticação necessária
router.get("/:id", loginMiddleware, checkSelfOrAdmin(), getUserById);
router.post(
  "/",
  rateLimit({ max: 20 }),
  registerUserValidationRules,
  validate,
  registerUser,
); //autenticação não necessária
router.patch(
  "/:id",
  loginMiddleware,
  checkSelfOrAdmin(),
  partialUpdateUserValidationRules,
  validate,
  partialUpdateUser,
);
router.delete("/:id", loginMiddleware, checkSelfOrAdmin(), deleteUser);

export default router;
