import {
  getEventsRepository,
  getEventByIdRepository,
  getEventByNameRepository,
} from "../repositories/eventRepository.js";
import { getMyEventsRepository } from "../repositories/participantRepository.js";
import { getUserByIdRepository } from "../repositories/usersRepository.js";

export const getEventsWeb = async (req, res) => {
  try {
    const { search } = req.query;
    let events;

    if (search && search.trim() !== "") {
      events = await getEventByNameRepository(search);
    } else {
      events = await getEventsRepository();
    }

    res.render("index", { events, searchTerm: search || "" });
  } catch (error) {
    res.status(500).send("Erro ao carregar o Agendia: " + error.message);
  }
};

export const getMyEventsWeb = async (req, res) => {
  try {
    const userId = req.userId;
    const events = await getMyEventsRepository(userId);
    res.render("meus-eventos", { userEvents: events });
  } catch (error) {
    res.status(500).send("Erro ao carregar seus eventos: " + error.message);
  }
};

//  Corrigido: Apenas um async e sem parênteses extras na abertura
export const getEventDetailsWeb = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await getEventByIdRepository(id);

    if (!event) {
      return res
        .status(404)
        .render("error", { message: "Evento não encontrado" });
    }

    const success = req.query.success === "true";
    res.render("details", { event, success });
  } catch (error) {
    res.status(500).send("Erro no servidor: " + error.message);
  }
};

export const registerPage = (req, res) => {
  res.render("register", { error: null });
};

export const loginPage = (req, res) => {
  const error = req.query.error;
  res.render("login", { error });
};

export const userPage = async (req, res) => {
  try {
    const user = await getUserByIdRepository(req.userId);

    if (!user) {
      return res.redirect("/login");
    }

    res.render("perfil", { user });
  } catch (error) {
    res.status(500).send("Erro ao carregar o perfil: " + error.message);
  }
};

export const createEventPage = (req, res) => {
  res.render("criar-evento", { event: null, error: null });
};

export const adminEventsPage = async (req, res) => {
  try {
    const events = await getEventsRepository();
    res.render("analisar-eventos", { events });
  } catch (error) {
    res
      .status(500)
      .send("Erro ao carregar o painel administrativo: " + error.message);
  }
};

export const editEventPage = async (req, res) => {
  try {
    const event = await getEventByIdRepository(req.params.id);

    if (!event) {
      return res
        .status(404)
        .render("error", { message: "Evento não encontrado" });
    }
    res.render("editar-evento", { event, error: null });
  } catch (error) {
    res.status(500).send("Erro ao carregar página de edição: " + error.message);
  }
};
