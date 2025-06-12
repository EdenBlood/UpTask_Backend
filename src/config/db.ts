import mongoose from "mongoose";
import colors from 'colors';
import { exit } from 'node:process';

export async function connectDB() {
  try {
    console.log(colors.cyan("Conectando a la Base de Datos..."))
    
    const { connection } = await mongoose.connect(process.env.DATABASE_URL)
    const url = `${connection.host}:${connection.port}`
    console.log(colors.bold.bgCyan.white(`MongoDB conectado en: ${url}`))
  } catch (error) {
    console.log(colors.bold.bgRed.white("Error al conectar a la Base de Datos"))
    exit(1)
  }
}