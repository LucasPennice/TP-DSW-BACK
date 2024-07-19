import { Request, Response } from "express";
import { Usuario } from "./usuario.entity.js";
import { UsuarioRepository } from "./usuario.repository.js";
import { Sexo, UserRole } from "../shared/types.js";
import { ExpressResponse } from "../shared/types.js";


const repository = new UsuarioRepository()

type _Body = Omit<Partial<Usuario>,"_id">;

async function findAll(req: Request, res: Response){
    try {
        const response : Usuario[] = await repository.findAll() ?? []
     
        const reponse : ExpressResponse<Usuario[]> = {message: "Usuarios encontrados:", data: response}
        res.json(reponse)
    } catch (error) {
        const reponse : ExpressResponse<Usuario> = {message: String(error), data: undefined}
        res.status(500).send(reponse)   
    }
}


async function findOne(req: Request, res: Response){
    const _id =  req.params.id 

    try {
        const usuario : Usuario | undefined = await repository.findOne({_id})
        
        if (!usuario){
            const reponse : ExpressResponse<Usuario> = {message: "Usuario no encontrado", data: undefined}
            return res.status(404).send(reponse)
        }
        res.json({data:usuario})
    } catch (error) {
        const reponse : ExpressResponse<Usuario> = {message: String(error), data: undefined}
        res.status(500).send(reponse)   
    }
}

async function add(req: Request, res: Response){
    const nombre = req.body.nombre as string
    const legajo = req.body.legajo as string
    const apellido = req.body.apellido as string
    const username = req.body.username as string
    const fechaNacimiento = req.body.fechaNacimiento as string
    const rol = req.body.rol as UserRole
    const sexo = req.body.sexo as Sexo

    // 🚨 VALIDAR CON ZOD 🚨
    
    const nuevoUsuario = new Usuario(legajo, nombre, apellido, username, fechaNacimiento, rol, sexo)

    try {
        const reponse : ExpressResponse<Usuario> = {message: "Usuario creada", data: await repository.add(nuevoUsuario)}

        res.status(201).send(reponse)
    } catch (error) {
        const reponse : ExpressResponse<Usuario> = {message: String(error), data: undefined}

        res.status(500).send(reponse)   
    }
}


async function modify(req: Request, res: Response){
    const _id =  req.params.id as string

    const nombre = req.body.nombre as string | undefined
    const legajo = req.body.legajo as string | undefined
    const apellido = req.body.apellido as string | undefined
    const username = req.body.username as string | undefined
    const fechaNacimiento = req.body.fechaNacimiento as string | undefined
    const rol = req.body.rol as UserRole | undefined
    const sexo = req.body.sexo as Sexo | undefined
    
    const body: _Body ={
        nombre: nombre,
        legajo: legajo,
        apellido: apellido,
        username: username,
        fechaNacimiento: fechaNacimiento,
        rol: rol,
        sexo: sexo
    }

    try {
        const usuarioModificado = await repository.update({_id}, body)
        
        if (!usuarioModificado){
            const response : ExpressResponse<Usuario> = {message: "Usuario no encontrado", data: undefined}
            
            return res.status(404).send(response)
        }
        
        const response : ExpressResponse<Usuario> = {message: "Usuario modificado", data: usuarioModificado}
        res.status(200).send(response)
    } catch (error) {

        const response : ExpressResponse<Usuario> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

async function delete_(req: Request, res: Response){
    const _id =  req.params.id as string;

    try {
        const usuarioBorrado = await repository.delete({_id})
    
        if(!usuarioBorrado){
            const response : ExpressResponse<Usuario> = {message: "Usuario no encontrado", data: undefined}
            return res.status(404).send(response)
        }
        
        const response : ExpressResponse<Usuario> = {message: "Usuario borrado", data: usuarioBorrado}
        res.status(200).send(response)
    } catch (error) {

        const response : ExpressResponse<Usuario> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

export{findAll, findOne, add, modify, delete_}