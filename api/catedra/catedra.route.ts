import express, { NextFunction, Request, Response } from "express";
import { Catedra } from "./catedra.entity.js";
import { orm } from "../orm.js";

const catedraRouter = express.Router();

catedraRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    const tentativeCatedraId =  req.params.id as string

    const foo = await orm.em.findOne(Catedra, tentativeCatedraId)

    await orm.em.flush();

    if (foo !== null){
        res.send(`${foo.nombre}`)
    }else{
        res.sendStatus(404)
    }
});

/*
{
    "nombre" : "mi Catedra",
}
*/

catedraRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
    const nombre = req.body.nombre as String


    // 🚨 VALIDAR CON ZOD 🚨
    
    const nuevoCatedra = new Catedra(nombre)
    
    try {
        await orm.em.persist(nuevoCatedra).flush();
        res.sendStatus(200)
    } catch (error) {
        res.send(`${error}`)
    }
});

catedraRouter.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
    const tentativeCatedraId =  req.params.id as string;

    const nombre = req.body.nombre as String | undefined

    const ref = orm.em.getReference(Catedra, tentativeCatedraId);
    
    if (nombre) ref.nombre = nombre
    
    try {
        await orm.em.flush();
        res.sendStatus(200)
    } catch (error) {
        res.send(`${error}`)
    }
});

catedraRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    const tentativeCatedraId =  req.params.id as string;

    const catedra = orm.em.getReference(Catedra, tentativeCatedraId);
    

    try {
        await orm.em.remove(catedra).flush();
        res.sendStatus(200)
    } catch (error) {
        res.send(`${error}`)
    }
});


export default catedraRouter;