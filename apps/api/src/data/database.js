import mongoose from "mongoose";
import { MONGO_URI } from "../config/env.js";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: "agendia",
    });
    console.log("✅ Conectado com sucesso ao banco de dados via Mongoose.");
  } catch (error) {
    console.error("❌ Falha ao conectar ao banco de dados via Mongoose", error);
    process.exit(1);
  }
};
export { connectDB };
