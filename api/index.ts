import express from "express"
import profesorRouter from "./profesor/profesor.route.js";
import usuarioRouter from "./usuario/usuario.route.js";
import bodyParser from "body-parser"; 
import { RequestContext } from "@mikro-orm/mongodb";
import { orm } from "./orm.js";
import materiaRouter from "./materia/materia.route.js";
import reviewRouter from "./review/review.route.js";
import areaRouter from "./area/area.route.js";
import cursadoRouter from "./cursado/cursado.route.js";
import cors from "cors"


const app = express()

app.use(cors())

const port = 3000;
app.use( bodyParser.json() );       // app.use(express.json() )
app.use(bodyParser.urlencoded({extended: true})); 

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});


app.use("/api/profesor", profesorRouter);
app.use("/api/area", areaRouter);
app.use("/api/usuario", usuarioRouter);
app.use("/api/materia", materiaRouter);
app.use("/api/review", reviewRouter);
app.use("/api/cursado", cursadoRouter);


app.get('/', (req, res) => {
  res.send(`
  Directorios: \n
  /api/profesor \n
  /api/usuario \n
  /api/area \n
  /api/materia \n
  `)
})


app.listen(port, () => {
  console.log(`⚡️ App corriendo en puerto: ${port} ⚡️`)
})
