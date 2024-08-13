import { NextFunction, Request, Response } from "express";
import { Cursado } from "./cursado.entity.js";
import { MateriaRepository } from "./cursado.repository.js";
import { ExpressResponse } from "../shared/types.js";

const repository = new MateriaRepository()

type _Body = Omit<Partial<Cursado>,"_id">;

async function findAll(req: Request, res: Response){
    try {
        const data : Cursado[] = await repository.findAll() ?? []
     
        const response : ExpressResponse<Cursado[]> = {message: "Materias Encontradas", data}
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
            const response : ExpressResponse<Cursado[]> = {message: "Cursado no Encontrada", data: undefined}
            return res.status(404).send(response)
        }
        const response : ExpressResponse<Cursado> = {message: "Materias Encontrada", data: cursado}
        res.json(response)
    } catch (error) {
        const response : ExpressResponse<Cursado> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

async function add(req: Request, res: Response){
    const nombre = req.body.nombre as string

    // 🚨 VALIDAR CON ZOD 🚨
    
    const nuevaMateria = new Cursado(nombre)
    try {
        const data : Cursado | undefined = await repository.add(nuevaMateria)

        const response : ExpressResponse<Cursado> = {message: "Cursado Creada", data}
        res.status(201).send(response)
    } catch (error) {
        const response : ExpressResponse<Cursado> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}


async function modify(req: Request, res: Response){
    const _id =  req.params.id as string

    const nombre = req.body.nombre as string | undefined
    
    const body: _Body = {nombre: nombre}

    try {
        const materiaModificada : Cursado | undefined = await repository.update({_id}, body)
        
        if (!materiaModificada){
            const response : ExpressResponse<Cursado> = {message: String("Cursado no encontrada"), data: undefined}
            return res.status(404).send(response)
        }
        
        const response : ExpressResponse<Cursado> = {message: String("Cursado modificada"), data: materiaModificada}
        res.status(200).send(response)
    } catch (error) {
        const response : ExpressResponse<Cursado> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

async function delete_(req: Request, res: Response){
    const _id =  req.params.id as string;

    try {
        const materiaBorrada : Cursado | undefined = await repository.delete({_id})
    
        if(!materiaBorrada){
            const response : ExpressResponse<Cursado> = {message: "Cursado no encontrada", data: undefined}
            return res.status(404).send(response)
        }

        const response : ExpressResponse<Cursado> = {message: String("Cursado Borrada"), data: materiaBorrada}
        res.status(200).send(response)
    } catch (error) {
        const response : ExpressResponse<Cursado> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

export{findAll, findOne, add, modify, delete_}