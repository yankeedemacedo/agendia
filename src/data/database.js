import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      dbName: "agendia",
    });
    console.log("✅ Conectado com sucesso ao banco de dados via Mongoose.");
  } catch (error) {
    console.error("❌ Falha ao conectar ao banco de dados via Mongoose", error);
    process.exit(1);
  }
};
export { connectDB };
