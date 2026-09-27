import app from "./app.js";
import { connectDB } from "./data/database.js";
import { PORT } from "./config/env.js";

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando em: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Falha ao iniciar o servidor:", error);
    process.exit(1);
  });
