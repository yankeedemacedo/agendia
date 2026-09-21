import { body } from "express-validator";

export const registerUserValidationRules = [
  body("nome").notEmpty().withMessage("O nome é obrigatório"),
  body("email")
    .notEmpty()
    .withMessage("O email é obrigatório")
    .isEmail()
    .withMessage("O email deve ser válido"),
  body("telefone")
    .notEmpty()
    .withMessage("O telefone é obrigatório")
    .isNumeric()
    .withMessage("O telefone deve conter apenas números")
    .isLength({ min: 11, max: 11 })
    .withMessage("O telefone deve estar no formato DDD+Número (11 dígitos)"),
  body("cpf")
    .notEmpty()
    .withMessage("O CPF é obrigatório")
    .isNumeric()
    .withMessage("O CPF deve conter apenas números")
    .isLength({ min: 11, max: 11 })
    .withMessage("O CPF deve conter 11 dígitos"),
  body("dataNascimento")
    .notEmpty()
    .withMessage("A data de nascimento é obrigatória")
    .isLength({ min: 10, max: 10 })
    .withMessage("A data de nascimento deve estar no formato DD/MM/YYYY"),
];

export const partialUpdateUserValidationRules = [
  body("nome").optional(),
  body("email").optional().isEmail().withMessage("O email deve ser válido"),
  body("telefone")
    .optional()
    .isNumeric()
    .withMessage("O telefone deve conter apenas números")
    .isLength({ min: 11, max: 11 })
    .withMessage("O telefone deve estar no formato DDD+Número (11 dígitos)"),
  body("cpf")
    .optional()
    .isNumeric()
    .withMessage("O CPF deve conter apenas números")
    .isLength({ min: 11, max: 11 })
    .withMessage("O CPF deve conter 11 dígitos"),
  body("dataNascimento")
    .optional()
    .isLength({ min: 10, max: 10 })
    .withMessage("A data de nascimento deve estar no formato DD/MM/YYYY"),
];
