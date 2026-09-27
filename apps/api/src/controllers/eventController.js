import {
  getEventsService,
  getMyEventsService,
  getEventCategoriesService,
  getPublicStatsService,
  getEventByNameService,
  getEventByIdService,
  createEventService,
  parcialUpdateEventService,
  deleteEventService,
} from "../services/eventService.js";
import {
  duplicateEventService,
  createRecurrenceService,
} from "../services/copyService.js";
import { getEventDashboardService } from "../services/dashboardService.js";
import { buildAttendeesCsv } from "../services/exportService.js";
import { listTicketsByEventRepository } from "../repositories/ticketRepository.js";

export const getEvents = async (req, res, next) => {
  try {
    const events = await getEventsService(req.query);
    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const getMyEvents = async (req, res, next) => {
  try {
    const events = await getMyEventsService(
      req.userId,
      req.query,
      req.userRole,
    );
    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const getEventCategories = async (req, res, next) => {
  try {
    const categories = await getEventCategoriesService();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const getPublicStats = async (req, res, next) => {
  try {
    res.json(await getPublicStatsService());
  } catch (error) {
    next(error);
  }
};

export const getEventbyName = async (req, res, next) => {
  try {
    const name = req.params.name;
    const event = await getEventByNameService(name);
    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const event = await getEventByIdService(id);
    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const event = await createEventService(req.body, req.userId);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

export const parcialUpdateEvent = async (req, res, next) => {
  try {
    const id = req.params.id;
    const eventData = req.body;
    const event = await parcialUpdateEventService(id, eventData, {
      userRole: req.userRole,
    });
    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const id = req.params.id;
    await deleteEventService(id);
    res.json({ message: "Evento removido com sucesso" });
  } catch (error) {
    next(error);
  }
};

export const duplicateEvent = async (req, res, next) => {
  try {
    const copy = await duplicateEventService(req.params.id);
    res.status(201).json(copy);
  } catch (error) {
    next(error);
  }
};

export const createRecurrence = async (req, res, next) => {
  try {
    const copies = await createRecurrenceService(req.params.id, req.body);
    res.status(201).json(copies);
  } catch (error) {
    next(error);
  }
};

export const getEventDashboard = async (req, res, next) => {
  try {
    const dashboard = await getEventDashboardService(req.params.id);
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};

export const exportAttendees = async (req, res, next) => {
  try {
    const attendees = await listTicketsByEventRepository(req.params.id);
    const csv = buildAttendeesCsv(attendees);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="participantes-${req.params.id}.csv"`,
    );
    res.send(`\ufeff${csv}`);
  } catch (error) {
    next(error);
  }
};
