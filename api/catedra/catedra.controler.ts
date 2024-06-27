import { Catedra } from "./catedra.entity.js";
import { CatedraRepository } from "./catedra.repository.js";
import { NextFunction, Request, Response } from "express";

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


interface _Body {
    nombre?: string;
}

async function findAll(req: Request, res: Response){
    const response : Catedra[] | undefined = await repository.findAll()

    res.json({data: response})
}

async function findOne(req: Request, res: Response){
    const _id =  req.params.id 

    const catedra : Catedra | undefined = await repository.findOne({_id})
    
    if (!catedra){
        return res.status(404).send({ message: "Catedra no encontrada"})
    }
    res.json({data:catedra})

}

function add(req: Request, res: Response){
    const nombre = req.body.nombre as string

    // 🚨 VALIDAR CON ZOD 🚨
    
    const nuevaCatedra = new Catedra(nombre)
    res.status(201).send({message:"Catedra creada ", data: repository.add(nuevaCatedra)})

}


function modify(req: Request, res: Response){

    
    const _id =  req.params.id as string

    const nombre = req.body.nombre as string | undefined
    
    const body: _Body ={
        nombre: nombre,
    }

    const catedraModificada = repository.update({_id}, body)
    
    if (!catedraModificada){
        return res.status(404).send({ message: "Catedra no encontrada"})
    }
    
    res.status(200).send({message:"Catedra modificada", data: catedraModificada})
}

function delete_(req: Request, res: Response){
    const _id =  req.params.id as string;

    const catedraBorrada = repository.delete({_id})

    if(!catedraBorrada){
        return res.status(404).send({ message: "Catedra no encontrada"})
    }
    res.status(200).send({message:"Catedra borrada", data: catedraBorrada})
}

export{findAll, findOne, add, modify, delete_}