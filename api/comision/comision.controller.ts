import { Request, Response } from "express";
import { Comision } from "./comision.entity.js";
import { ComisionRepository } from "./comision.repository.js";
import { ExpressResponse } from "../shared/types.js";

const repository = new ComisionRepository()

type _Body = Partial<Comision>;

async function findAll(req: Request, res: Response){
    try {
        const response : Comision[] = await repository.findAll() ?? []
     
        const reponse : ExpressResponse<Comision[]> = {message: "Comision encontradas:", data: response}
        res.json(reponse)
    } catch (error) {
        const reponse : ExpressResponse<Comision> = {message: String(error), data: undefined}
        res.status(500).send(reponse)   
    }
}

async function findOne(req: Request, res: Response){
    const _id =  req.params.id 

    try {
        const comision : Comision | undefined = await repository.findOne({_id})
        
        if (!comision){
            const reponse : ExpressResponse<Comision> = {message: "Comision no encontrada", data: undefined}
            return res.status(404).send(reponse)
        }
        res.json({data:comision})
    } catch (error) {
        const reponse : ExpressResponse<Comision> = {message: String(error), data: undefined}
        res.status(500).send(reponse)   
    }
}

async function add(req: Request, res: Response){
    const numero = req.body.numero as number

    // 🚨 VALIDAR CON ZOD 🚨
    
    const numeroComision = new Comision(numero)
    try {
        const reponse : ExpressResponse<Comision> = {message: "Comision creada", data: await repository.add(numeroComision)}

        res.status(201).send(reponse)
    } catch (error) {
        const reponse : ExpressResponse<Comision> = {message: String(error), data: undefined}

        res.status(500).send(reponse)   
    }
}


async function modify(req: Request, res: Response){
    const _id =  req.params.id as string

    const numero = req.body.numero as number | undefined
    
    const body: _Body = {numero: numero}

    try {
        const comisionModificada = await repository.update({_id}, body)
        
        if (!comisionModificada){
            const response : ExpressResponse<Comision> = {message: "Comision no encontrada", data: undefined}
            
            return res.status(404).send(response)
        }
        
        const response : ExpressResponse<Comision> = {message: "Comision modificada", data: comisionModificada}
        res.status(200).send(response)
    } catch (error) {

        const response : ExpressResponse<Comision> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

async function delete_(req: Request, res: Response){
    const _id =  req.params.id as string;

    try {
        const comisionBorrada = await repository.delete({_id})
    
        if(!comisionBorrada){
            const response : ExpressResponse<Comision> = {message: "Comision no encontrada", data: undefined}
            return res.status(404).send(response)
        }
        
        const response : ExpressResponse<Comision> = {message: "Comision borrada", data: comisionBorrada}
        res.status(200).send(response)
    } catch (error) {

        const response : ExpressResponse<Comision> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

export { add, delete_, findAll, findOne, modify };
