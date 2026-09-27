import { randomBytes } from "node:crypto";

// Payload impresso no QR do ingresso: "AGENDIA1:<ticketId>:<code>"
const QR_PREFIX = "AGENDIA1";

export const generateCheckInCode = () =>
  randomBytes(4).toString("hex").toUpperCase();

export const buildQrPayload = (ticketId, code) =>
  `${QR_PREFIX}:${ticketId}:${code}`;

export const parseQrPayload = (text) => {
  if (typeof text !== "string") return null;
  const parts = text.trim().split(":");
  if (parts.length !== 3 || parts[0] !== QR_PREFIX) return null;
  const [, ticketId, code] = parts;
  if (!ticketId || !/^[0-9A-F]{8}$/.test(code)) return null;
  return { ticketId, code };
};
