import express from "express"
import profesorRouter from "./routes/profesor.js";

const app = express()
const port = 3000

app.use("/api/profesor", profesorRouter);

app.get('/', (req, res) => {
  res.send(`
  Directorios: \n
  /api/profesor
  `)
})

app.listen(port, () => {
  console.log(`⚡️ App corriendo en puerto: ${port} ⚡️`)
})
