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

const router = Router();

router.get("/", loginMiddleware, getUsers); //autenticação necessária
router.get("/search/:name", loginMiddleware, getUserbyName); //autenticação necessária
router.get("/:id", loginMiddleware, getUserById); //autenticação necessária, só pode acessar seu próprio perfil ou se for admin
router.post("/", registerUserValidationRules, validate, registerUser); //autenticação não necessária
router.patch(
  "/:id", loginMiddleware,
  partialUpdateUserValidationRules,
  validate,
  partialUpdateUser,
); //autenticação necessária, só pode atualizar seu próprio perfil ou se for admin
router.delete("/:id", loginMiddleware, deleteUser); //autenticação necessária, só pode deletar seu próprio perfil ou se for admin

export default router;
