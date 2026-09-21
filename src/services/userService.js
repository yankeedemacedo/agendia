import {
  getUsersRepository,
  getUserByNameRepository,
  getUserByIdRepository,
  registerUserRepository,
  partialUpdateUserRepository,
  deleteUserRepository,
  getUserByCpfRepository,
  getUserByEmailRepository,
} from "../repositories/usersRepository.js";

export const getUsersService = async () => {
  const users = await getUsersRepository();
  return users;
};

export const getUserByNameService = async (name) => {
  const user = await getUserByNameRepository(name);
  if (!user) {
    throw new Error("Nenhum usuário encontrado com o nome informado");
  }
  return user;
};

export const getUserByIdService = async (id) => {
  const user = await getUserByIdRepository(id);
  if (!user) {
    throw new Error("Nenhum usuário encontrado com o ID informado");
  }
  return user;
};

export const registerUserService = async (userData) => {
  const { cpf } = userData;

  const userExists = await getUserByCpfRepository(cpf);
  if (userExists) {
    const error = new Error("CPF já cadastrado!");
    error.statusCode = 409; // 💡 Injeta o status para o globalErrorHandler usar
    throw error;
  }

  const emailExists = await getUserByEmailRepository(userData.email);
  if (emailExists) {
    const error = new Error("E-mail já cadastrado!");
    error.statusCode = 409;
    throw error;
  }

  const newUser = await registerUserRepository(userData);
  return newUser;
};

export const partialUpdateUserService = async (id, userData) => {
  const user = await partialUpdateUserRepository(id, userData);
  if (!user) {
    throw new Error("Usuário não encontrado");
  }
  return user;
};

export const deleteUserService = async (id) => {
  const user = await deleteUserRepository(id);
  if (!user) {
    throw new Error("Usuário não encontrado");
  }
  return user;
};
