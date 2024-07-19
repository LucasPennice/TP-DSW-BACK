import { Request, Response } from "express";
import { Catedra } from "./catedra.entity.js";
import { CatedraRepository } from "./catedra.repository.js";
import { ExpressResponse } from "../shared/types.js";

const repository = new CatedraRepository()

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

type _Body = Partial<Catedra>;

async function findAll(req: Request, res: Response){
    try {
        const response : Catedra[] = await repository.findAll() ?? []
     
        const reponse : ExpressResponse<Catedra[]> = {message: "Catedras encontradas:", data: response}
        res.json(reponse)
    } catch (error) {
        const reponse : ExpressResponse<Catedra> = {message: String(error), data: undefined}
        res.status(500).send(reponse)   
    }
}

async function findOne(req: Request, res: Response){
    const _id =  req.params.id 

    try {
        const catedra : Catedra | undefined = await repository.findOne({_id})
        
        if (!catedra){
            const reponse : ExpressResponse<Catedra> = {message: "Catedra no encontrada", data: undefined}
            return res.status(404).send(reponse)
        }
        res.json({data:catedra})
    } catch (error) {
        const reponse : ExpressResponse<Catedra> = {message: String(error), data: undefined}
        res.status(500).send(reponse)   
    }
}

async function add(req: Request, res: Response){
    const nombre = req.body.nombre as string

    // 🚨 VALIDAR CON ZOD 🚨
    
    const nuevaCatedra = new Catedra(nombre)
    try {
        const reponse : ExpressResponse<Catedra> = {message: "Catedra creada", data: await repository.add(nuevaCatedra)}

        res.status(201).send(reponse)
    } catch (error) {
        const reponse : ExpressResponse<Catedra> = {message: String(error), data: undefined}

        res.status(500).send(reponse)   
    }
}


async function modify(req: Request, res: Response){
    const _id =  req.params.id as string

    const nombre = req.body.nombre as string | undefined
    
    const body: _Body = {nombre: nombre}

    try {
        const catedraModificada = await repository.update({_id}, body)
        
        if (!catedraModificada){
            const response : ExpressResponse<Catedra> = {message: "Catedra no encontrada", data: undefined}
            
            return res.status(404).send(response)
        }
        
        const response : ExpressResponse<Catedra> = {message: "Catedra modificada", data: catedraModificada}
        res.status(200).send(response)
    } catch (error) {

        const response : ExpressResponse<Catedra> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

async function delete_(req: Request, res: Response){
    const _id =  req.params.id as string;

    try {
        const catedraBorrada = await repository.delete({_id})
    
        if(!catedraBorrada){
            const response : ExpressResponse<Catedra> = {message: "Catedra no encontrada", data: undefined}
            return res.status(404).send(response)
        }
        
        const response : ExpressResponse<Catedra> = {message: "Catedra borrada", data: catedraBorrada}
        res.status(200).send(response)
    } catch (error) {

        const response : ExpressResponse<Catedra> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

export { add, delete_, findAll, findOne, modify };
