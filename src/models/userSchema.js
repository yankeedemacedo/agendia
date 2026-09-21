import { UUID } from "mongodb";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    nome: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    telefone: { type: String, required: true },
    dataNascimento: { type: Date, required: true },
    cpf: { type: String, required: true, unique: true, trim: true },
    senha: { type: String, required: true },
    papel: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Relacionamento com o Model Evento
    eventos: [
      {
        type: String,
        ref: "event",
      },
    ],
  },
  {
    timestamps: false,
    _id: true,
  },
);

const users = mongoose.model("users", userSchema);
export default users;
