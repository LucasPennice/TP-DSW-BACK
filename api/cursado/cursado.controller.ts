import { NextFunction, Request, Response } from "express";
import { Cursado } from "./cursado.entity.js";
import { CursadoRepository } from "./cursado.repository.js";
import { ExpressResponse } from "../shared/types.js";
import { Materia } from "../materia/materia.entity.js";
import {MateriaRepository} from "../materia/materia.repository.js" ;
import { Profesor } from "../profesor/profesor.entity.js";
import { ProfesorRepository } from "../profesor/profesor.repository.js";

const repository = new CursadoRepository()
const repositoryMaterias = new MateriaRepository()
const repositoryProfesor = new ProfesorRepository()

type _Body = Omit<Partial<Cursado>,"_id">;

async function findAll(req: Request, res: Response){
    try {
        const data : Cursado[] = await repository.findAll() ?? []
     
        const response : ExpressResponse<Cursado[]> = {message: "Cursados Encontrados", data}
        res.json(response)
    } catch (error) {
        const response : ExpressResponse<Cursado[]> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

async function findOne(req: Request, res: Response){
    const _id =  req.params.id 

    try {
        const cursado : Cursado | undefined = await repository.findOne({_id})
        
        if (!cursado){
            const response : ExpressResponse<Cursado> = {message: "Cursado no Encontrada", data: undefined}
            return res.status(404).send(response)
        }
        const response : ExpressResponse<Cursado> = {message: "Cursado Encontrado", data: cursado}
        res.json(response)
    } catch (error) {
        const response : ExpressResponse<Cursado> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

async function add(req: Request, res: Response){

    const diaCursado = req.body.diaCursado as string
    const horaCursado = req.body.horaCursado as string
    const comision = req.body.comision as number
    const turno = req.body.turno as string
    const año = req.body.año as number
    const materiaId = req.body.materia as string;
    const profesorId = req.body.profesor as string;

    const materia : Materia | undefined = await repositoryMaterias.findOne({_id: materiaId})

    const profesor : Profesor | undefined = await repositoryProfesor.findOne({_id: profesorId})

    if (!materia){
        const response : ExpressResponse<Cursado> = {message: "Materia no Válida", data: undefined}
        return res.status(404).send(response)
    }
    if (!profesor){
        const response : ExpressResponse<Cursado> = {message: "Profesor no Válido", data: undefined}
        return res.status(404).send(response)
    }

    const nuevoCursado = new Cursado(diaCursado, horaCursado, comision, turno, año, materia, profesor)

    try {
        const data : Cursado | undefined = await repository.add(nuevoCursado)

        const response : ExpressResponse<Cursado> = {message: "Cursado Creada", data}
        res.status(201).send(response)
    } catch (error) {
        const response : ExpressResponse<Cursado> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}


async function modify(req: Request, res: Response){
    const _id =  req.params.id as string

    const diaCursado = req.body.diaCursado as string | undefined
    const horaCursado = req.body.horaCursado as string | undefined
    const comision = req.body.comision as number | undefined
    const turno = req.body.turno as string | undefined
    const año = req.body.año as number | undefined
    
    const body: _Body = {
        diaCursado: diaCursado,
        horaCursado : horaCursado,
        comision : comision,
        turno : turno,
        año : año,
    }

    try {
        const cursadoModificado : Cursado | undefined = await repository.update({_id}, body)
        
        if (!cursadoModificado){
            const response : ExpressResponse<Cursado> = {message: String("Cursado no encontrada"), data: undefined}
            return res.status(404).send(response)
        }
        
        const response : ExpressResponse<Cursado> = {message: String("Cursado modificada"), data: cursadoModificado}
        res.status(200).send(response)
    } catch (error) {
        const response : ExpressResponse<Cursado> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

async function delete_(req: Request, res: Response){
    const _id =  req.params.id as string;

    try {
        const cursadoBorrado : Cursado | undefined = await repository.delete({_id})
    
        if(!cursadoBorrado){
            const response : ExpressResponse<Cursado> = {message: "Cursado no encontrada", data: undefined}
            return res.status(404).send(response)
        }

        const response : ExpressResponse<Cursado> = {message: String("Cursado Borrada"), data: cursadoBorrado}
        res.status(200).send(response)
    } catch (error) {
        const response : ExpressResponse<Cursado> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

export{findAll, findOne, add, modify, delete_}