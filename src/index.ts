import 'dotenv/config'
import server from './server'
import colors from 'colors'
import { connectDB } from './config/db';

//* Creamos el Puerto.
const port = process.env.PORT || 4000;

async function startServer() {
  //* Nos conectamos a la Base de Datos. 
  await connectDB();

  //* Levantamos el servidor.
  server.listen( port, () => {
    console.log(colors.bold.bgGreen.white(`Servidor corriendo en el puerto: ${port}`))
  })
}

startServer();