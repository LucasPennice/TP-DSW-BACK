import { Request, Response } from "express";
import { Usuario } from "./usuario.entity.js";
import { UsuarioRepository } from "./usuario.repository.js";

const repository = new UsuarioRepository()

interface _Body {
    nombre?: string;
    legajo?: string;
}

async function findAll(req: Request, res: Response){
    const response: Usuario[] | undefined = await repository.findAll()
    
    try {
        res.json({data: response})
    } catch (error) {
        res.status(500).send({message: error})
    }
}

async function findOne(req: Request, res: Response){
    const _id =  req.params.id 

    try {
        const usuario : Usuario | undefined = await repository.findOne({_id})

        if (!usuario){
            return res.status(404).send({ message: "Usuario no encontrado"})
        }

        res.json({data:usuario})
    } catch (error) {
        res.status(500).send({message: error})
    }
}

function add(req: Request, res: Response){
    const nombre = req.body.nombre as string
    const legajo = req.body.legajo as string

    // 🚨 VALIDAR CON ZOD 🚨
    
    const nuevoUsuario = new Usuario(legajo, nombre)

    try {
        res.status(201).send({message:"Usuario creado", data: repository.add(nuevoUsuario)})
    } catch (error) {
        res.status(500).send({message: error})
    }
}


function modify(req: Request, res: Response){
    const _id =  req.params.id as string

    const nombre = req.body.nombre as string | undefined
    const legajo = req.body.legajo as string | undefined
    
    const body: _Body ={
        nombre: nombre,
        legajo: legajo
    }

    try {
        const usuarioModificado = repository.update({_id}, body)
        
        if (!usuarioModificado){
            return res.status(404).send({ message: "Usuario no encontrada"})
        }
        
        res.status(200).send({message:"Usuario modificada", data: usuarioModificado})
    } catch (error) {
        res.status(500).send({message: error})
    }
}

function delete_(req: Request, res: Response){
    const _id =  req.params.id as string;

    try {
        const usuarioBorrado = repository.delete({_id})

        if(!usuarioBorrado){
            return res.status(404).send({ message: "Usuario no encontrado"})
        }
        res.status(200).send({message:"Usuario no encontrado", data: usuarioBorrado})
    } catch (error) {
        res.status(500).send({message: error})
    }
}

export{findAll, findOne, add, modify, delete_}