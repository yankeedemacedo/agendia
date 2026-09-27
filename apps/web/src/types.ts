export interface User {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  papel: "user" | "organizer" | "admin";
  eventos: string[];
}

export interface EventItem {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  horario: string;
  local: string;
  acesso: string;
  vagas: number;
  categoria: string;
  tags: string[];
  status: string;
  capaUrl: string;
  inicio?: string;
  fim?: string;
  participantes: string[];
}

export interface Paged<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Ticket {
  id: string;
  eventId: string;
  status: "ativa" | "presente" | "cancelada";
  checkInCode: string;
  checkInAt: string | null;
  qr: string;
}

export interface WaitlistEntry {
  position: number;
  userId: string;
  createdAt: string;
  user: { id: string; nome: string; email: string } | null;
}

export interface Attendee extends Ticket {
  userId: string;
  user: { id: string; nome: string; email: string } | null;
}

export interface EventStats {
  vagas: number;
  inscritos: number;
  presentes: number;
  ausentes: number;
  waitlist: number;
  ocupacao: number;
  taxaPresenca: number;
}

export interface Dashboard {
  resumo: { eventos: number } & EventStats;
  top: { event: EventItem; stats: EventStats }[];
  eventos: { event: EventItem; stats: EventStats }[];
}

export type EventsResponse = EventItem[] | Paged<EventItem>;

export function isPaged(res: EventsResponse): res is Paged<EventItem> {
  return !Array.isArray(res);
}
