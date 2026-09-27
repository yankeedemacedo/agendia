import user from "../models/userSchema.js"; // Certifique-se de que o nome/caminho do seu model de usuários está correto
import event from "../models/eventSchema.js";
import ticket from "../models/ticketSchema.js";
import { usersListResponseDTO, usersResponseDTO } from "../dtos/usersDTO.js";
import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";

const isDuplicateKey = (error) => error?.code === 11000;

const toConflictError = (error) => {
  const fields = Object.keys(error.keyValue ?? {});
  const detail = fields.length > 0 ? ` (${fields.join(", ")})` : "";
  const conflict = new Error(`Registro duplicado${detail}.`);
  conflict.statusCode = 409;
  return conflict;
};

export const getUsersRepository = async () => {
  const users = await user.find();
  return usersListResponseDTO(users);
};

export const getUserByIdRepository = async (id) => {
  const foundUser = await user.findOne({ id: id });
  return foundUser ? usersResponseDTO(foundUser) : null;
};

export const getUserByNameRepository = async (name) => {
  const users = await user.find({
    nome: { $regex: name, $options: "i" },
  });
  return usersListResponseDTO(users);
};

export const getUserByCpfRepository = async (cpf) => {
  const foundUser = await user.findOne({ cpf: cpf });
  return foundUser ? usersResponseDTO(foundUser) : null;
};

export const getUserByEmailRepository = async (email) => {
  const foundUser = await user.findOne({ email: email });
  return foundUser ? usersResponseDTO(foundUser) : null;
};

export const registerUserRepository = async (userData) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userData.senha, saltRounds);

  // `papel` nunca vem do cadastro público — todo mundo nasce `user`
  const { papel, ...dadosCadastro } = userData;

  const newUser = new user({
    id: randomUUID(),
    ...dadosCadastro,
    senha: hashedPassword,
    papel: "user",
    eventos: [],
  });

  try {
    await newUser.save();
  } catch (error) {
    if (isDuplicateKey(error)) throw toConflictError(error);
    throw error;
  }
  return usersResponseDTO(newUser);
};

export const partialUpdateUserRepository = async (
  id,
  userData,
  requester = {},
) => {
  const currentUser = await user.findOne({ id: id });
  if (!currentUser) {
    return null;
  }

  const { senhaAtual, papel, ...updatable } = userData;

  if (!senhaAtual) {
    const error = new Error("A senha atual é obrigatória para atualizar.");
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await bcrypt.compare(senhaAtual, currentUser.senha);
  if (!isMatch) {
    const error = new Error("Senha atual incorreta");
    error.statusCode = 401;
    throw error;
  }

  // Só admin pode trocar o papel; nunca persiste `senhaAtual`
  if (papel !== undefined && requester.userRole === "admin") {
    updatable.papel = papel;
  }

  if (updatable.senha) {
    const saltRounds = 10;
    updatable.senha = await bcrypt.hash(updatable.senha, saltRounds);
  }

  try {
    const updatedUser = await user.findOneAndUpdate(
      { id: id },
      { $set: updatable },
      { new: true, runValidators: true },
    );

    return updatedUser ? usersResponseDTO(updatedUser) : null;
  } catch (error) {
    if (isDuplicateKey(error)) throw toConflictError(error);
    throw error;
  }
};

export const deleteUserRepository = async (id, senhaAtual) => {
  const currentUser = await user.findOne({ id: id });
  if (!currentUser) {
    return null;
  }

  if (!senhaAtual) {
    const error = new Error("A senha atual é obrigatória para deletar.");
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await bcrypt.compare(senhaAtual, currentUser.senha);
  if (!isMatch) {
    const error = new Error("Senha incorreta");
    error.statusCode = 401;
    throw error;
  }

  const deletedUser = await user.findOneAndDelete({ id: id });

  // Limpa referências órfãs nos eventos e os tickets
  await Promise.all([
    event.updateMany(
      { participantes: id },
      { $pull: { participantes: id } },
    ),
    ticket.deleteMany({ userId: id }),
  ]);

  return deletedUser ? usersResponseDTO(deletedUser) : null;
};
