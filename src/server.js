import app from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./data/database.js";

dotenv.config();

const PORT = process.env.PORT;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
  });
});
