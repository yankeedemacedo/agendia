export const usersResponseDTO = (user) => {
  if (!user) return null;

  // Converte o documento do Mongoose para um objeto JavaScript puro
  const rawUser = user.toObject ? user.toObject() : user;

  // Campos explícitos: nunca vaza `senha`, `_id` ou `__v`
  const { id, nome, email, telefone, dataNascimento, papel, eventos } = rawUser;

  return {
    id,
    nome,
    email,
    telefone,
    dataNascimento,
    papel,
    eventos: Array.isArray(eventos) ? eventos : [],
  };
};

export const usersListResponseDTO = (users) => {
  if (!users || !Array.isArray(users)) return [];

  return users.map((user) => usersResponseDTO(user));
};
