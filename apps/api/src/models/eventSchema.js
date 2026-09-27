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
    categoria: { type: String, trim: true, default: "Geral" },
    tags: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["rascunho", "publicado", "encerrado"],
      default: "publicado",
    },
    capaUrl: { type: String, trim: true, default: "" },
    inicio: { type: Date },
    fim: { type: Date },
    // Dono do evento (organizador criador). Nulo em eventos legados.
    criadoPor: { type: String, default: null },

    // O tipo aqui passa a referenciar o ID customizado (String) do Usuário
    participantes: [
      {
        type: String,
        ref: "users",
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
