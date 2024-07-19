import { NextFunction, Request, Response } from "express";
import { Materia } from "./materia.entity.js";
import { MateriaRepository } from "./materia.repository.js";

const repository = new MateriaRepository()

interface _Body {
    nombre?: string;
}

async function findAll(req: Request, res: Response){
    try {
        const response : Materia[] | undefined = await repository.findAll()
     
        res.json({data: response})
    } catch (error) {
        res.status(500).send(error)   
    }
}

async function findOne(req: Request, res: Response){
    const _id =  req.params.id 

    try {
        const materia : Materia | undefined = await repository.findOne({_id})
        
        if (!materia){
            return res.status(404).send({ message: "Materia no encontrada"})
        }
        res.json({data: materia})
    } catch (error) {
        res.status(500).send(error)   
    }
}

function add(req: Request, res: Response){
    const nombre = req.body.nombre as string

    // 🚨 VALIDAR CON ZOD 🚨
    
    const nuevaMateria = new Materia(nombre)
    try {
        res.status(201).send({message:"Materia creada ", data: repository.add(nuevaMateria)})
    } catch (error) {
        res.status(500).send(error)   
    }
}


function modify(req: Request, res: Response){
    const _id =  req.params.id as string

    const nombre = req.body.nombre as string | undefined
    
    const body: _Body ={
        nombre: nombre,
    }

    try {
        const materiaModificada = repository.update({_id}, body)
        
        if (!materiaModificada){
            return res.status(404).send({ message: "Materia no encontrada"})
        }
        
        res.status(200).send({message:"Materia modificada", data: materiaModificada})
    } catch (error) {
        res.status(500).send(error)   
    }
}

function delete_(req: Request, res: Response){
    const _id =  req.params.id as string;

    try {
        const materiaBorrada = repository.delete({_id})
    
        if(!materiaBorrada){
            return res.status(404).send({ message: "Materia no encontrada"})
        }
        res.status(200).send({message:"Materia borrada", data: materiaBorrada})
    } catch (error) {
        res.status(500).send(error)   
    }
}

export{findAll, findOne, add, modify, delete_}