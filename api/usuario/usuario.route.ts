import express, { NextFunction, Request, Response } from "express";
import { Usuario } from "./usuario.entity.js";
import { orm } from "../orm.js";

const usuarioRouter = express.Router();

usuarioRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    const tentativeUsuarioId =  req.params.id as string

    const foo = await orm.em.findOne(Usuario, tentativeUsuarioId)

    await orm.em.flush();

    if (foo !== null){
        res.send(`${foo.nombre}`)
    }else{
        res.sendStatus(404)
    }
});

/*
{
    "nombre" : "mi usuario",
    "legajo" : "12345"
}
*/

usuarioRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
    const nombre = req.body.nombre as String
    const legajo = req.body.legajo as String

    // 🚨 VALIDAR CON ZOD 🚨
    
    const nuevoUsuario = new Usuario(nombre, legajo)
    
    try {
        await orm.em.persist(nuevoUsuario).flush();
        res.sendStatus(200)
    } catch (error) {
        res.send(`${error}`)
    }
});

usuarioRouter.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
    const tentativeUsuarioId =  req.params.id as string;

    const nombre = req.body.nombre as String | undefined
    const legajo = req.body.legajo as String | undefined

    const ref = orm.em.getReference(Usuario, tentativeUsuarioId);
    
    if (nombre) ref.nombre = nombre
    if (legajo) ref.legajo = legajo
    
    try {
        await orm.em.flush();
        res.sendStatus(200)
    } catch (error) {
        res.send(`${error}`)
    }
});

usuarioRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    const tentativeUsuarioId =  req.params.id as string;

    const usuario = orm.em.getReference(Usuario, tentativeUsuarioId);
    

    try {
        await orm.em.remove(usuario).flush();
        res.sendStatus(200)
    } catch (error) {
        res.send(`${error}`)
    }
});


export default usuarioRouter;