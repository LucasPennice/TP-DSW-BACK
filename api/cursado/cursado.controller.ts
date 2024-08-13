import { NextFunction, Request, Response } from "express";
import { Cursado } from "./cursado.entity.js";
import { CursadoRepository } from "./cursado.repository.js";
import { ExpressResponse } from "../shared/types.js";

const repository = new CursadoRepository()

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

    const diaCursado = req.body.diaCursado as string
    const horaCursado = req.body.horaCursado as string[]
    const comision = req.body.comision as number
    const turno = req.body.turno as string
    const año = req.body.año as number

    
    const nuevoCursado = new Cursado(diaCursado, horaCursado, comision, turno, año)
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
    const horaCursado = req.body.horaCursado as string[] | undefined
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