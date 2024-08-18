import { Request, Response } from "express";
import { dateFromString } from "../dateExtension.js";
import { Sexo } from "../shared/types.js";
import { Profesor } from "./profesor.entity.js";
import { ProfesorRepository } from "./profesor.repository.js";
import { ExpressResponse } from "../shared/types.js";

const repository = new ProfesorRepository()

type _Body = Omit<Partial<Profesor>,"_id">;

async function findAll(req: Request, res: Response){
    try {
        const response : Profesor[] | undefined = await repository.findAll()

        const reponse : ExpressResponse<Profesor[]> = {message: "Profesores encontrados:", data: response}
        res.json(reponse)
    } catch (error) {
        const response : ExpressResponse<Profesor> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

async function findOne(req: Request, res: Response){
    const _id =  req.params.id 
 
    try {
        const profesor : Profesor | undefined = await repository.findOne({_id})
    
        if (!profesor){
            const response : ExpressResponse<Profesor> = {message: "Profesor no encontrado", data: undefined}
            return res.status(404).send(response)
        }
        res.json({data:profesor})
    } catch (error) {
        const response : ExpressResponse<Profesor> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

async function add(req: Request, res: Response){
    const nombre = req.body.nombre as string
    const apellido = req.body.apellido as string
    const fechaNacimiento = req.body.fechaNacimiento as string // DD/MM/AAAA
    const dni = req.body.dni as number
    const cursadas = req.body.cursadas as string[]
    const puntuacionGeneral = req.body.puntuacionGeneral as number | undefined
    const sexoTentativo = req.body.sexo as string
    const sexo : Sexo = sexoTentativo == Sexo.Hombre ? Sexo.Hombre : Sexo.Mujer

    // 🚨 VALIDAR CON ZOD 🚨
    
    const nuevoProfesor = new Profesor(nombre, apellido, dateFromString(fechaNacimiento), dni, cursadas, puntuacionGeneral ?? 0, sexo)

    try {
        const response : ExpressResponse<Profesor> = {message: "Profesor creado", data: await repository.add(nuevoProfesor)}
        res.status(201).send(response)
    } catch (error) {
        const response : ExpressResponse<Profesor> = {message: String(error), data: undefined}
        res.status(500).send(response)
    }

}


async function modify(req: Request, res: Response){
    const _id =  req.params.id as string

    const nombre = req.body.nombre as string | undefined
    const apellido = req.body.apellido as string | undefined
    const dni = req.body.dni as number | undefined
    const cursadas = req.body.cursadas as string[] | undefined
    const puntuacionGeneral = req.body.puntuacionGeneral as number | undefined
    const sexoTentativo = req.body.sexo as String | undefined
    const sexo : Sexo = sexoTentativo == Sexo.Hombre ? Sexo.Hombre : Sexo.Mujer
    
    const body: _Body ={
        nombre: nombre,
        apellido: apellido,
        dni: dni,
        cursadas: cursadas,
        puntuacionGeneral: puntuacionGeneral,
        sexo: sexo
    }

    try {
        const profesorModificado = await repository.update({_id}, body)
        
        if (!profesorModificado){
            const response : ExpressResponse<Profesor> = {message: "Profesor  no encontrado", data: undefined}
            return res.status(404).send(response)
        }
        
        res.status(200).send({message:"profesor modificado", data: profesorModificado})
    } catch (error) {
        const response : ExpressResponse<Profesor> = {message: String(error), data: undefined}
        res.status(500).send(response)
    }
}

async function delete_(req: Request, res: Response){
    const _id =  req.params.id as string;

    try {
        const profesorBorrado = await repository.delete({_id})
        
        if(!profesorBorrado){
            const response : ExpressResponse<Profesor> = {message: "Profesor no encontrado", data: undefined}
            return res.status(404).send(response)
        }

        const response : ExpressResponse<Profesor> = {message: "Profesor borrado", data: profesorBorrado}
        res.status(200).send(response)

    } catch (error) {
        const response : ExpressResponse<Profesor> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

export { add, delete_, findAll, findOne, modify };
