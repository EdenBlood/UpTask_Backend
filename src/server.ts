import express from "express"
import projectRoutes from './routes/projectRouters'
import cors, { CorsOptions } from "cors"
import morgan from "morgan"
import authRoutes from "./routes/authRoutes"
import profileRoutes from './routes/profileRoutes'

//* Instancia de Express.
const app = express()

//* Configuracion de los Cors.
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error("Error de CORS"))
    }
  },
};

app.use(cors(corsOptions))

//* Habilitamos la lectura de JSONs
app.use(express.json())

//* Lectura de los Logs con Morgan.
app.use(morgan('dev'))

//* Montamos las rutas de los Routes.
app.use("/api/auth",authRoutes)
app.use("/api/projects", projectRoutes)
app.use('/api/profile', profileRoutes)

export default app;