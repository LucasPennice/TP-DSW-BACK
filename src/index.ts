import express from "express"
import { Profesor } from "../entities/profesor.js"

const app = express()
const port = 3000

app.get('/', (req, res) => {
  const profesor = new Profesor()
  res.send(`Hola ${profesor.nombre}`)
})

app.listen(port, () => {
  console.log(`⚡️ App corriendo en puerto: ${port} ⚡️`)
})
