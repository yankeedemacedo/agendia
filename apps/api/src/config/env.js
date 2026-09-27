import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Ancora o .env na raiz do repo, independente da pasta de onde o comando roda
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../../..");
dotenv.config({ path: path.join(ROOT, ".env") });

const required = ["MONGO_URI", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `❌ Variáveis de ambiente obrigatórias ausentes: ${missing.join(", ")}. Copie .env.example para .env e preencha os valores.`,
  );
  process.exit(1);
}

export const PORT = Number(process.env.PORT) || 3000;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const isProd = process.env.NODE_ENV === "production";
