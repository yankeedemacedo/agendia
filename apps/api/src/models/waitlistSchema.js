import mongoose from "mongoose";

// Fila de espera por evento. Ordem = createdAt crescente.
// Promoção automática acontece ao liberar vaga (cancelamento).
const waitlistSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    eventId: { type: String, required: true },
    userId: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    _id: true,
  },
);

waitlistSchema.index({ eventId: 1, userId: 1 }, { unique: true });
waitlistSchema.index({ eventId: 1, createdAt: 1 });

const waitlist = mongoose.model("waitlist", waitlistSchema);
export default waitlist;
