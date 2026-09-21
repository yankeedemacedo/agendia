import user from "../models/userSchema.js"; // Certifique-se de apontar para o seu model de usuários
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Validar se email e senha foram enviados
  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  try {
    // 2. Encontrar o usuário no banco de dados usando Mongoose
    const foundUser = await user.findOne({ email: email });

    if (!foundUser) {
      return res.status(401).json({ error: "E-mail ou senha incorretos." });
    }

    // 3. Verificar se a senha está correta
    const passwordMatch = await bcrypt.compare(password, foundUser.senha);
    if (!passwordMatch) {
      return res.status(401).json({ error: "E-mail ou senha incorretos." });
    }

    // 4. Se tudo estiver correto, gerar o Token JWT
    // Usamos o seu campo 'id' customizado (UUID) para o payload do token
    const payload = {
      userId: foundUser.id,
      name: foundUser.nome,
      userRole: foundUser.papel,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    // 5. Anexa o token no cabeçalho através do Cookie HttpOnly
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1 * 60 * 60 * 1000, // 1 hora
    });

    // 6. RETORNO JSON: Avisamos ao front-end que deu certo
    return res.status(200).json({
      success: true,
      redirectTo: "/",
    });
  } catch (error) {
    console.error("Erro no processamento do login:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
};
