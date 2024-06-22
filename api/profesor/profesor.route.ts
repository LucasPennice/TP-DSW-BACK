import express, { NextFunction, Request, Response } from "express";
import { Profesor, Sexo } from "./profesor.entity.js";
import { dateFromString } from "../dateExtension.js";
import { orm } from "../orm.js";

const profesorRouter = express.Router();

profesorRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    const tentativeProfId =  req.params.id as string

    const foo = await orm.em.findOne(Profesor, tentativeProfId)

    await orm.em.flush();

    if (foo !== null){
        res.send(`${foo.nombre}`)
    }else{
        res.sendStatus(404)
    }
});

/*
{
    "nombre" : "mi profesor",
    "apellido" : "aoekkuidio",
    "fechaNacimiento" : "19/03/2001",
    "dni" : 43167696,
    "cargos" : [],
    "horariosDeClase" : ["MARTES - 12:32"],
    "puntuacionGeneral" : 2,
    "sexo" : "Hombre"
}
*/

profesorRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
    const nombre = req.body.nombre as String
    const apellido = req.body.apellido as String
    const fechaNacimiento = req.body.fechaNacimiento as String // DD/MM/AAAA
    const dni = req.body.dni as Number
    const cargos = req.body.cargos as String[]
    const horariosDeClase = req.body.horariosDeClase as String[] // "DIA_SEMANA - HH:MM" formato 24hs
    const puntuacionGeneral = req.body.puntuacionGeneral as Number | undefined
    const sexoTentativo = req.body.sexo as String

    const sexo : Sexo = sexoTentativo == Sexo.Hombre ? Sexo.Hombre : Sexo.Mujer

    // 🚨 VALIDAR CON ZOD 🚨
    
    const nuevoProfesor = new Profesor(nombre, apellido, dateFromString(fechaNacimiento), dni, cargos, horariosDeClase, puntuacionGeneral ?? 0, sexo)
    
    try {
        await orm.em.persist(nuevoProfesor).flush();
        res.sendStatus(200)
    } catch (error) {
        res.send(`${error}`)
    }
});

profesorRouter.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
    const tentativeProfId =  req.params.id as string;

    const nombre = req.body.nombre as String | undefined
    const apellido = req.body.apellido as String | undefined
    const fechaNacimiento = req.body.fechaNacimiento as String | undefined // DD/MM/AAAA
    const dni = req.body.dni as Number | undefined
    const cargos = req.body.cargos as String[] | undefined
    const horariosDeClase = req.body.horariosDeClase as String[] | undefined // "DIA_SEMANA - HH:MM" formato 24hs
    const puntuacionGeneral = req.body.puntuacionGeneral as Number | undefined
    const sexoTentativo = req.body.sexo as String | undefined

    const sexo : Sexo = sexoTentativo == Sexo.Hombre ? Sexo.Hombre : Sexo.Mujer

    const ref = orm.em.getReference(Profesor, tentativeProfId);
    
    if (nombre) ref.nombre = nombre
    if (apellido) ref.apellido = apellido
    if (fechaNacimiento) ref.fechaNacimiento = dateFromString(fechaNacimiento)
    if (dni) ref.dni = dni
    if (cargos !== undefined) ref.cargos = cargos
    if (horariosDeClase) ref.horariosDeClase = horariosDeClase
    if (puntuacionGeneral) ref.puntuacionGeneral = puntuacionGeneral
    if (sexoTentativo) ref.sexo = sexo
    
    try {
        await orm.em.flush();
        res.sendStatus(200)
    } catch (error) {
        res.send(`${error}`)
    }
});

profesorRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    const tentativeProfId =  req.params.id as string;

    const profesor = orm.em.getReference(Profesor, tentativeProfId);
    

    try {
        await orm.em.remove(profesor).flush();
        res.sendStatus(200)
    } catch (error) {
        res.send(`${error}`)
    }
});


export default profesorRouter;