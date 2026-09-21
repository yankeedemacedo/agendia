import user from "../models/userSchema.js"; // Certifique-se de que o nome/caminho do seu model de usuários está correto
import { usersListResponseDTO, usersResponseDTO } from "../dtos/usersDTO.js";
import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";

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

  const newUser = new user({
    id: randomUUID(),
    ...userData,
    senha: hashedPassword,
    eventos: [],
  });

  await newUser.save();
  return usersResponseDTO(newUser);
};

export const partialUpdateUserRepository = async (id, userData) => {
  const currentUser = await user.findOne({ id: id });
  if (!currentUser) {
    return null;
  }
  const isMatch = await bcrypt.compare(userData.senhaAtual, currentUser.senha);
  if (!isMatch) {
    throw new Error("Senha atual incorreta");
  }
  if (userData.senha) {
    const saltRounds = 10;
    userData.senha = await bcrypt.hash(userData.senha, saltRounds);
  }
  const updatedUser = await user.findOneAndUpdate(
    { id: id },
    { $set: userData },
    { new: true, runValidators: true },
  );

  return updatedUser ? usersResponseDTO(updatedUser) : null;
};

export const deleteUserRepository = async (id, senhaAtual) => {
  const currentUser = await user.findOne({ id: id });
  if (!currentUser) {
    return null;
  }

  const isMatch = await bcrypt.compare(senhaAtual, currentUser.senha);
  if (!isMatch) {
    throw new Error("Senha incorreta");
  }

  const deletedUser = await user.findOneAndDelete({ id: id });
  return deletedUser ? usersResponseDTO(deletedUser) : null;
};
