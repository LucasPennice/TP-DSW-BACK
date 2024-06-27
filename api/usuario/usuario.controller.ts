import { Request, Response } from "express";
import { Usuario } from "./usuario.entity.js";
import { UsuarioRepository } from "./usuario.repository.js";

const repository = new UsuarioRepository()


interface _Body {
    nombre?: string;
    legajo?: string;
}

function findAll(req: Request, res: Response){
    res.json({data: repository.findAll()})
}

function findOne(req: Request, res: Response){
    const _id =  req.params.id 

    const usuario = repository.findOne({_id})
    
    if (!usuario){
        return res.status(404).send({ message: "Usuario no encontrado"})
    }
    res.json({data:usuario})

}

function add(req: Request, res: Response){
    const nombre = req.body.nombre as string
    const legajo = req.body.legajo as string

    // 🚨 VALIDAR CON ZOD 🚨
    
    const nuevoUsuario = new Usuario(legajo, nombre)
    res.status(201).send({message:"Usuario creado", data: repository.add(nuevoUsuario)})

}


function modify(req: Request, res: Response){

    
    const _id =  req.params.id as string

    const nombre = req.body.nombre as string | undefined
    const legajo = req.body.legajo as string | undefined
    
    const body: _Body ={
        nombre: nombre,
        legajo: legajo
    }

    const usuarioModificado = repository.update({_id}, body)
    
    if (!usuarioModificado){
        return res.status(404).send({ message: "Usuario no encontrada"})
    }
    
    res.status(200).send({message:"Usuario modificada", data: usuarioModificado})
}

function delete_(req: Request, res: Response){
    const _id =  req.params.id as string;

    const usuarioBorrado = repository.delete({_id})

    if(!usuarioBorrado){
        return res.status(404).send({ message: "Usuario no encontrado"})
    }
    res.status(200).send({message:"Usuario no encontrado", data: usuarioBorrado})
}

export{findAll, findOne, add, modify, delete_}