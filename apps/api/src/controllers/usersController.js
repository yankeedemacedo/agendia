import {
  getUsersService,
  getUserByNameService,
  getUserByIdService,
  registerUserService,
  partialUpdateUserService,
  deleteUserService,
} from "../services/userService.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await getUsersService();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserbyName = async (req, res, next) => {
  try {
    const name = req.params.name;
    const user = await getUserByNameService(name);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await getUserByIdService(id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const registerUser = async (req, res) => {
  try {
    const newUser = await registerUserService(req.body);

    // Retorno de sucesso
    return res.status(201).json({
      message: "Cadastro realizado com sucesso!",
      user: newUser,
    });
  } catch (error) {
    console.error("Erro no registerUser:", error);
    const statusCode = error.statusCode || 400;

    return res.status(statusCode).json({
      error: error.message,
    });
  }
};

export const partialUpdateUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    // O perfil web envia `novaSenha`; a API interna usa `senha`
    const { novaSenha, ...rest } = req.body;
    const userData = novaSenha ? { ...rest, senha: novaSenha } : rest;
    const user = await partialUpdateUserService(id, userData, {
      userId: req.userId,
      userRole: req.userRole,
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    // O perfil web envia `senhaAtual`; aceita `senha` como alias legado
    const senhaAtual = req.body?.senhaAtual ?? req.body?.senha;

    // Verificar se a senha foi fornecida
    if (!senhaAtual) {
      return res
        .status(400)
        .json({ error: "A senha atual é obrigatória para deletar o usuário." });
    }

    await deleteUserService(id, senhaAtual);
    res.json({ message: "Usuário removido com sucesso" });
  } catch (error) {
    next(error);
  }
};
