import mongoose from "mongoose";

// Registro de inscrição (base do check-in/certificados).
// Espelha os arrays `event.participantes` / `user.eventos`, mantidos por
// compatibilidade e limpos junto na exclusão de usuário/evento.
const ticketSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    eventId: { type: String, required: true },
    userId: { type: String, required: true },
    status: {
      type: String,
      enum: ["ativa", "presente", "cancelada"],
      default: "ativa",
    },
    // Código impresso no QR; validado no check-in junto com o ticket
    checkInCode: { type: String, required: true },
    checkInAt: { type: Date },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    _id: true,
  },
);

ticketSchema.index({ eventId: 1, userId: 1 }, { unique: true });

const tickets = mongoose.model("tickets", ticketSchema);
export default tickets;
