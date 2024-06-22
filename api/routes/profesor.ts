import express, { NextFunction, Request, Response } from "express";
import { Profesor, Sexo } from "../entities/profesor.js";
import { dateFromString } from "../dateExtension.js";

const profesorRouter = express.Router();

profesorRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    const tentativeProfId =  req.params.id as String;
    res.send(`${tentativeProfId}`)
});

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

    res.send(`queres crear un prof con nombre ${nombre}`)
});

profesorRouter.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
    const tentativeProfId =  req.params.id as String;
    
    const nombre = req.body.nombre as String | undefined
    const apellido = req.body.apellido as String | undefined
    const fechaNacimiento = req.body.fechaNacimiento as String | undefined // DD/MM/AAAA
    const dni = req.body.dni as Number | undefined
    const cargos = req.body.cargos as String[] | undefined
    const horariosDeClase = req.body.horariosDeClase as String[] | undefined // "DIA_SEMANA - HH:MM" formato 24hs
    const puntuacionGeneral = req.body.puntuacionGeneral as Number | undefined
    const sexoTentativo = req.body.sexo as String | undefined

    const sexo : Sexo = sexoTentativo == Sexo.Hombre ? Sexo.Hombre : Sexo.Mujer


    res.send(`queres actualizar el prof ${nombre}`)
});

profesorRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    const tentativeProfId =  req.params.id as String;

    res.send(`queres borrar el prof ${tentativeProfId}`)
});


export default profesorRouter;