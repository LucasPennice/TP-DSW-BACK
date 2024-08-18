import { Request, Response } from "express";
import { Area } from "./area.entity.js";
import { AreaRepository } from "./area.repository.js";
import { ExpressResponse } from "../shared/types.js";

const repository = new AreaRepository()

/*
function sanitizeCatedraInput(req: Request, res: Response, next: NextFunction){
    req.body.sanitizeCatedraInput = {
        "name": req.body.name
    }
    
    Object.keys(req.body.sanitizeCatedraInput).forEach(key =>{
        if(req.body.sanitizeCatedraInput[key] == undefined){
            delete req.body.sanitizeCatedraInput[key]
        }
    })
    next()
}
*/ 

type _Body = Omit<Partial<Area>,"_id">;

async function findAll(req: Request, res: Response){
    try {
        const response : Area[] = await repository.findAll() ?? []
     
        const reponse : ExpressResponse<Area[]> = {message: "Areas encontradas:", data: response}
        res.json(reponse)
    } catch (error) {
        const reponse : ExpressResponse<Area> = {message: String(error), data: undefined}
        res.status(500).send(reponse)   
    }
}

async function findOne(req: Request, res: Response){
    const _id =  req.params.id 

    try {
        const area : Area | undefined = await repository.findOne({_id})
        
        if (!area){
            const reponse : ExpressResponse<Area> = {message: "Area no encontrada", data: undefined}
            return res.status(404).send(reponse)
        }
        res.json({data:area})
    } catch (error) {
        const reponse : ExpressResponse<Area> = {message: String(error), data: undefined}
        res.status(500).send(reponse)   
    }
}

async function add(req: Request, res: Response){
    const nombre = req.body.nombre as string

    // 🚨 VALIDAR CON ZOD 🚨
    
    const nuevoArea = new Area(nombre)
    try {
        const reponse : ExpressResponse<Area> = {message: "Area creada", data: await repository.add(nuevoArea)}

        res.status(201).send(reponse)
    } catch (error) {
        const reponse : ExpressResponse<Area> = {message: String(error), data: undefined}

        res.status(500).send(reponse)   
    }
}


async function modify(req: Request, res: Response){
    const _id =  req.params.id as string

    const nombre = req.body.nombre as string | undefined
    
    const body: _Body = {nombre: nombre}

    try {
        const areaModificada = await repository.update({_id}, body)
        
        if (!areaModificada){
            const response : ExpressResponse<Area> = {message: "Area no encontrada", data: undefined}
            
            return res.status(404).send(response)
        }
        
        const response : ExpressResponse<Area> = {message: "Area modificada", data: areaModificada}
        res.status(200).send(response)
    } catch (error) {

        const response : ExpressResponse<Area> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

async function delete_(req: Request, res: Response){
    const _id =  req.params.id as string;

    try {
        const areaBorrada = await repository.delete({_id})
    
        if(!areaBorrada){
            const response : ExpressResponse<Area> = {message: "Area no encontrada", data: undefined}
            return res.status(404).send(response)
        }
        
        const response : ExpressResponse<Area> = {message: "Area borrada", data: areaBorrada}
        res.status(200).send(response)
    } catch (error) {

        const response : ExpressResponse<Area> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

export { add, delete_, findAll, findOne, modify };
