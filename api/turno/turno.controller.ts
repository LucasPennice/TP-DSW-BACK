import { Request, Response } from "express";
import { Turno } from "./turno.entity.js";
import { TurnoRepository } from "./turno.repository.js";
import { ExpressResponse } from "../shared/types.js";

const repository = new TurnoRepository()

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

type _Body = Omit<Partial<Turno>,"_id">;

async function findAll(req: Request, res: Response){
    try {
        const response : Turno[] = await repository.findAll() ?? []
     
        const reponse : ExpressResponse<Turno[]> = {message: "Turnos encontrados:", data: response}
        res.json(reponse)
    } catch (error) {
        const reponse : ExpressResponse<Turno> = {message: String(error), data: undefined}
        res.status(500).send(reponse)   
    }
}

async function findOne(req: Request, res: Response){
    const _id =  req.params.id 

    try {
        const turno : Turno | undefined = await repository.findOne({_id})
        
        if (!turno){
            const reponse : ExpressResponse<Turno> = {message: "Turno no encontrado", data: undefined}
            return res.status(404).send(reponse)
        }
        res.json({data:turno})
    } catch (error) {
        const reponse : ExpressResponse<Turno> = {message: String(error), data: undefined}
        res.status(500).send(reponse)   
    }
}

async function add(req: Request, res: Response){
    const nombre = req.body.nombre as string

    // 🚨 VALIDAR CON ZOD 🚨
    
    const nuevoTurno = new Turno(nombre)
    try {
        const reponse : ExpressResponse<Turno> = {message: "Turno creado", data: await repository.add(nuevoTurno)}

        res.status(201).send(reponse)
    } catch (error) {
        const reponse : ExpressResponse<Turno> = {message: String(error), data: undefined}

        res.status(500).send(reponse)   
    }
}


async function modify(req: Request, res: Response){
    const _id =  req.params.id as string

    const nombre = req.body.nombre as string | undefined
    
    const body: _Body = {nombre: nombre}

    try {
        const turnoModificado = await repository.update({_id}, body)
        
        if (!turnoModificado){
            const response : ExpressResponse<Turno> = {message: "Turno no encontrado", data: undefined}
            
            return res.status(404).send(response)
        }
        
        const response : ExpressResponse<Turno> = {message: "Turno modificado", data: turnoModificado}
        res.status(200).send(response)
    } catch (error) {

        const response : ExpressResponse<Turno> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

async function delete_(req: Request, res: Response){
    const _id =  req.params.id as string;

    try {
        const turnoBorrado = await repository.delete({_id})
    
        if(!turnoBorrado){
            const response : ExpressResponse<Turno> = {message: "Turno no encontrado", data: undefined}
            return res.status(404).send(response)
        }
        
        const response : ExpressResponse<Turno> = {message: "Turno borrado", data: turnoBorrado}
        res.status(200).send(response)
    } catch (error) {

        const response : ExpressResponse<Turno> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

export { add, delete_, findAll, findOne, modify };
