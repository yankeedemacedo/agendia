import waitlist from "../models/waitlistSchema.js";
import event from "../models/eventSchema.js";
import user from "../models/userSchema.js";
import { randomUUID } from "node:crypto";

const withStatus = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const joinWaitlistRepository = async (eventId, userId) => {
  const [foundEvent, foundUser] = await Promise.all([
    event.findOne({ id: eventId }),
    user.findOne({ id: userId }),
  ]);
  if (!foundEvent) throw withStatus("Evento não encontrado", 404);
  if (!foundUser) throw withStatus("Usuário não encontrado", 404);
  if (foundEvent.participantes.includes(userId)) {
    throw withStatus("Você já está inscrito neste evento.", 409);
  }

  try {
    const entry = await waitlist.create({
      id: randomUUID(),
      eventId,
      userId,
    });
    return { id: entry.id, eventId, userId, createdAt: entry.createdAt };
  } catch (error) {
    if (error?.code === 11000) {
      throw withStatus("Você já está na waitlist deste evento.", 409);
    }
    throw error;
  }
};

export const leaveWaitlistRepository = async (eventId, userId) => {
  const removed = await waitlist.findOneAndDelete({ eventId, userId });
  return Boolean(removed);
};

export const getWaitlistPositionRepository = async (eventId, userId) => {
  const mine = await waitlist.findOne({ eventId, userId });
  if (!mine) return null;
  const ahead = await waitlist.countDocuments({
    eventId,
    createdAt: { $lt: mine.createdAt },
  });
  return ahead + 1;
};

export const peekFirstWaitlistRepository = async (eventId) =>
  waitlist.findOne({ eventId }).sort({ createdAt: 1 });

export const removeWaitlistEntryRepository = async (eventId, userId) =>
  waitlist.deleteOne({ eventId, userId });

export const listWaitlistByEventRepository = async (eventId) => {
  const entries = await waitlist.find({ eventId }).sort({ createdAt: 1 });
  const users = await user.find({
    id: { $in: entries.map((e) => e.userId) },
  });
  const byId = new Map(users.map((u) => [u.id, u]));
  return entries.map((e, i) => ({
    position: i + 1,
    userId: e.userId,
    createdAt: e.createdAt,
    user: (() => {
      const u = byId.get(e.userId);
      return u ? { id: u.id, nome: u.nome, email: u.email } : null;
    })(),
  }));
};

export const countWaitlistRepository = async (eventId) =>
  waitlist.countDocuments({ eventId });
