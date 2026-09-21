import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    titulo: { type: String, required: true, trim: true },
    descricao: { type: String, required: true, trim: true },
    data: { type: String, required: true },
    horario: { type: String, required: true },
    local: { type: String, required: true, trim: true },
    acesso: {
      type: String,
      enum: ["Público", "Privado", "Restrito"],
      default: "Público",
    },
    vagas: { type: Number, required: true, min: 0 },

    // O tipo aqui passa a referenciar o ID customizado (String) do Usuário
    participantes: [
      {
        type: String,
        ref: "user",
      },
    ],
  },
  {
    timestamps: false,
    _id: true,
  },
);

const events = mongoose.model("events", eventSchema);
export default events;
