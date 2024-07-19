import { Request, Response } from "express";
import { dateFromString } from "../dateExtension.js";
import { Sexo } from "../shared/types.js";
import { Profesor } from "./profesor.entity.js";
import { ProfesorRepository } from "./profesor.repository.js";

const repository = new ProfesorRepository()

type _Body = Partial<Profesor>

async function findAll(req: Request, res: Response){
    try {
        const response : Profesor[] | undefined = await repository.findAll()
        res.json({data: response})
    } catch (error) {
        res.status(500).send(error)   
    }
}

async function findOne(req: Request, res: Response){
    const _id =  req.params.id 
 
    try {
        const profesor : Profesor | undefined = await repository.findOne({_id})
    
        if (!profesor){
            return res.status(404).send({ message: "profesor no encontrado"})
        }
        res.json({data:profesor})
    } catch (error) {
        res.status(500).send(error)   
    }
}

function add(req: Request, res: Response){
    const nombre = req.body.nombre as string
    const apellido = req.body.apellido as string
    const fechaNacimiento = req.body.fechaNacimiento as string // DD/MM/AAAA
    const dni = req.body.dni as number
    const cargos = req.body.cargos as string[]
    const horariosDeClase = req.body.horariosDeClase as string[] // "DIA_SEMANA - HH:MM" formato 24hs
    const puntuacionGeneral = req.body.puntuacionGeneral as number | undefined
    const sexoTentativo = req.body.sexo as string
    const sexo : Sexo = sexoTentativo == Sexo.Hombre ? Sexo.Hombre : Sexo.Mujer

    // 🚨 VALIDAR CON ZOD 🚨
    
    const nuevoProfesor = new Profesor(nombre, apellido, dateFromString(fechaNacimiento), dni, cargos, horariosDeClase, puntuacionGeneral ?? 0, sexo)

    try {
        res.status(201).send({message:"profesor creado", data: repository.add(nuevoProfesor)})
    } catch (error) {
        res.status(500).send(error)
    }

}


function modify(req: Request, res: Response){
    const _id =  req.params.id as string

    const nombre = req.body.nombre as string | undefined
    const apellido = req.body.apellido as string | undefined
    const dni = req.body.dni as number | undefined
    const cargos = req.body.cargos as string[] | undefined
    const horariosDeClase = req.body.horariosDeClase as string[] | undefined // "DIA_SEMANA - HH:MM" formato 24hs
    const puntuacionGeneral = req.body.puntuacionGeneral as number | undefined
    const sexoTentativo = req.body.sexo as String | undefined
    const sexo : Sexo = sexoTentativo == Sexo.Hombre ? Sexo.Hombre : Sexo.Mujer
    
    const body: _Body ={
        nombre: nombre,
        apellido: apellido,
        dni: dni,
        cargos: cargos,
        horariosDeClase: horariosDeClase,
        puntuacionGeneral: puntuacionGeneral,
        sexo: sexo
    }

    try {
        const profesorModificada = repository.update({_id}, body)
        
        if (!profesorModificada){
            return res.status(404).send({ message: "profesor no encontrado"})
        }
        
        res.status(200).send({message:"profesor modificado", data: profesorModificada})
    } catch (error) {
            res.status(500).send(error)
    }
}

function delete_(req: Request, res: Response){
    const _id =  req.params.id as string;

    try {
        const profesorBorrado = repository.delete({_id})
        
        if(!profesorBorrado){
            return res.status(404).send({ message: "profesor no encontrado"})
        }
        res.status(200).send({message:"profesor borrado", data: profesorBorrado})

    } catch (error) {
        res.status(500).send(error)   
    }
}

export { add, delete_, findAll, findOne, modify };
