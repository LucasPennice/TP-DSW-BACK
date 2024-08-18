import { NextFunction, Request, Response } from "express";
import { Materia } from "./materia.entity.js";
import { MateriaRepository } from "./materia.repository.js";
import { ExpressResponse } from "../shared/types.js";
import { Area } from "../area/area.entity.js";
import { AreaRepository } from "../area/area.repository.js";

const repository = new MateriaRepository()
const repositoryAreas = new AreaRepository()

type _Body = Omit<Partial<Materia>,"_id">;

async function findAll(req: Request, res: Response){
    try {
        const data : Materia[] = await repository.findAll() ?? []
     
        const response : ExpressResponse<Materia[]> = {message: "Materias Encontradas", data}
        res.json(response)
    } catch (error) {
        const response : ExpressResponse<Materia[]> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

async function findOne(req: Request, res: Response){
    const _id =  req.params.id 

    try {
        const materia : Materia | undefined = await repository.findOne({_id})
        
        if (!materia){
            const response : ExpressResponse<Materia[]> = {message: "Materia no Encontrada", data: undefined}
            return res.status(404).send(response)
        }
        const response : ExpressResponse<Materia> = {message: "Materias Encontrada", data: materia}
        res.json(response)
    } catch (error) {
        const response : ExpressResponse<Materia> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

async function add(req: Request, res: Response){
    const nombre = req.body.nombre as string
    const areaId = req.body.areaId as string

    const area : Area | undefined = await repositoryAreas.findOne({_id: areaId})


    // 🚨 VALIDAR CON ZOD 🚨
    if (!area){
        const response : ExpressResponse<Area> = {message: "Area no Válida", data: undefined}
        return res.status(404).send(response)
    }

    const nuevaMateria = new Materia(nombre, area)
    try {
        const data : Materia | undefined = await repository.add(nuevaMateria)

        const response : ExpressResponse<Materia> = {message: "Materia Creada", data}
        res.status(201).send(response)
    } catch (error) {
        const response : ExpressResponse<Materia> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}


async function modify(req: Request, res: Response){
    const _id =  req.params.id as string

    const nombre = req.body.nombre as string | undefined
    
    const body: _Body = {nombre: nombre}

    try {
        const materiaModificada : Materia | undefined = await repository.update({_id}, body)
        
        if (!materiaModificada){
            const response : ExpressResponse<Materia> = {message: String("Materia no encontrada"), data: undefined}
            return res.status(404).send(response)
        }
        
        const response : ExpressResponse<Materia> = {message: String("Materia modificada"), data: materiaModificada}
        res.status(200).send(response)
    } catch (error) {
        const response : ExpressResponse<Materia> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

async function delete_(req: Request, res: Response){
    const _id =  req.params.id as string;

    try {
        const materiaBorrada : Materia | undefined = await repository.delete({_id})
    
        if(!materiaBorrada){
            const response : ExpressResponse<Materia> = {message: "Materia no encontrada", data: undefined}
            return res.status(404).send(response)
        }

        const response : ExpressResponse<Materia> = {message: String("Materia Borrada"), data: materiaBorrada}
        res.status(200).send(response)
    } catch (error) {
        const response : ExpressResponse<Materia> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

export{findAll, findOne, add, modify, delete_}