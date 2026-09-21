export const usersResponseDTO = (user) => {
  if (!user) return null;

  // Converte o documento do Mongoose para um objeto JavaScript puro
  const rawUser = user.toObject ? user.toObject() : user;

  // Adicionamos o 'id', 'dataNascimento' e o 'papel' na desestruturação
  const { id, nome, email, idade, telefone, dataNascimento, papel } = rawUser;

  // Retornamos tudo estruturado, garantindo um valor padrão para o papel caso venha vazio
  return {
    id,
    nome,
    email,
    idade,
    telefone,
    dataNascimento,
    papel,
  };
};

export const usersListResponseDTO = (users) => {
  if (!users || !Array.isArray(users)) return [];

  return users.map((user) => usersResponseDTO(user));
};
