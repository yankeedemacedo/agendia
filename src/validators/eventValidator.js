import { body } from "express-validator";

export const eventCreateValidationRules = [
  body("titulo").notEmpty().withMessage("O título é obrigatório"),
  body("descricao").optional(),
  body("data")
    .notEmpty()
    .withMessage("A data é obrigatória")
    .isLength({ min: 10, max: 10 })
    .withMessage("A data deve estar no formato DD-MM-YYYY"),
  body("horario")
    .notEmpty()
    .withMessage("O horário é obrigatório")
    .isLength({ min: 5, max: 5 })
    .withMessage("O horário deve estar no formato HH:mm"),
  body("local").notEmpty().withMessage("O local é obrigatório"),
  body("vagas")
    .notEmpty()
    .withMessage("O número de vagas é obrigatório")
    .isNumeric()
    .withMessage("O número de vagas deve ser um valor numérico"),
  body("acesso")
    .notEmpty()
    .withMessage("O acesso é obrigatório")
    .isIn(["Público", "Privado", "Restrito"])
    .withMessage("O acesso deve ser 'Público', 'Privado' ou 'Restrito'"),
];

export const eventUpdateValidationRules = [
  body("titulo")
    .optional()
    .notEmpty()
    .withMessage("Se enviado, o título não pode estar vazio"),

  body("descricao").optional(),

  body("data")
    .optional()
    .isLength({ min: 10, max: 10 })
    .withMessage("A data deve estar no formato DD-MM-YYYY"),

  body("horario")
    .optional()
    .isLength({ min: 5, max: 5 })
    .withMessage("O horário deve estar no formato HH:mm"),

  body("local")
    .optional()
    .notEmpty()
    .withMessage("Se enviado, o local não pode estar vazio"),

  body("participantes")
    .optional()
    .isArray()
    .withMessage("Os participantes devem ser um array de strings"),

  body("acesso")
    .optional()
    .isIn(["Público", "Privado", "Restrito"])
    .withMessage("O acesso deve ser 'Público', 'Privado' ou 'Restrito'"),
];
