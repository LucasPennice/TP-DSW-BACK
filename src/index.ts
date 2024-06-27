import express from "express"
import profesorRouter from "./profesor/profesor.route.js";
import usuarioRouter from "./usuario/usuario.route.js";
import catedraRouter from "./catedra/catedra.route.js";
import bodyParser from "body-parser"; 
import { RequestContext } from "@mikro-orm/mongodb";
import { orm } from "./orm.js";


const app = express()
const port = 3000
app.use( bodyParser.json() );       // app.use(express.json() )
app.use(bodyParser.urlencoded({extended: true})); 



app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});


app.use("/api/profesor", profesorRouter);
app.use("/api/catedra", catedraRouter);
app.use("/api/usuario", usuarioRouter);


app.get('/', (req, res) => {
  res.send(`
  Directorios: \n
  /api/profesor \n
  /api/usuario \n
  /api/catedra \n
  `)
})


app.listen(port, () => {
  console.log(`⚡️ App corriendo en puerto: ${port} ⚡️`)
})
