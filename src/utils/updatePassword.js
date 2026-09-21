import bcrypt from "bcrypt";
import { db } from "../data/data.js";

const hashPassword = async () => {
  // Aguarda a leitura do banco, caso o método read() seja assíncrono
  await db.read();
  const users = db.data.users;

  // Usamos for...of para que o await funcione corretamente a cada iteração
  for (const user of users) {
    const password = user.senha;
    const saltRounds = 10;

    // Agora o await vai esperar o hash ser gerado antes de ir para o próximo usuário
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log(`Senha original: ${password}`);
    console.log(`Hash gerado: ${hashedPassword}`);

    user.password = hashedPassword;
  }

  // É melhor salvar o banco de dados UMA ÚNICA VEZ após modificar todos os usuários,
  // em vez de salvar a cada passada do loop (o que pesa na memória/disco).
  await db.write();
};

// Executa a função
hashPassword();

export default hashPassword;
