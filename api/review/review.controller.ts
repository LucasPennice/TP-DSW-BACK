import { Request, Response } from "express";
import { Review } from "./review.entity.js";
import { ExpressResponse, UserRole } from "../shared/types.js";
import { Usuario } from "../usuario/usuario.entity.js";
import { findOneUsuario} from "../usuario/usuario.controller.js"
import { findOneCursado} from "../cursado/cursado.controller.js"
import { orm } from "../orm.js";
import { Cursado } from "../cursado/cursado.entity.js";


async function findAll(req: Request, res: Response){
    try {
        const reviews : Review[] | undefined = await orm.em.findAll(Review, {
            populate: ['*'],
          })

        await orm.em.flush();

        const reponse : ExpressResponse<Review[]> = {message: "Reviews encontradas:", data: reviews}
        res.json(reponse)
    } catch (error) {
        const response : ExpressResponse<Review> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

async function findOne(req: Request, res: Response){
    const _id =  req.params.id 
 
    try {
        const review : Review | null = await orm.em.findOne(Review, _id, {
            populate: ['*'],
          })

        await orm.em.flush();
        if (!review){
            const response : ExpressResponse<Review> = {message: "Review no encontrada", data: undefined}
            return res.status(404).send(response)
        }
        res.json({data:review})
    } catch (error) {
        const response : ExpressResponse<Review> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

async function add(req: Request, res: Response){
    const descripcion = req.body.descripcion as string
    const puntuacion = req.body.puntuacion as number
    const usuarioId = req.body.usuarioId as string;
    const cursadoId = req.body.cursadoId as string;

    // 🚨 VALIDAR CON ZOD 🚨
    
    const usuario : Usuario | null = await findOneUsuario(usuarioId)

    if (!usuario){
        const response : ExpressResponse<Usuario> = {message: "Usuario no Válido", data: undefined}
        return res.status(404).send(response)
    }

    const cursado : Cursado | null = await findOneCursado(cursadoId)


    if (!cursado){
        const response : ExpressResponse<Usuario> = {message: "Cursado no Válido", data: undefined}
        return res.status(404).send(response)
    }

    const nuevaReview = new Review(descripcion, puntuacion, usuario, cursado)

    try {
        await orm.em.persist(nuevaReview).flush();
        const response : ExpressResponse<Review> = {message: "Review creada", data: nuevaReview}
        res.status(201).send(response)
    } catch (error) {
        const response : ExpressResponse<Review> = {message: String(error), data: undefined}
        res.status(500).send(response)
    }

}


async function modify(req: Request, res: Response){
    const _id =  req.params.id as string

    const descripcion = req.body.descripcion as string
    const puntuacion = req.body.puntuacion as number


    try {
        const reviewAModificar = orm.em.getReference(Review, _id);
        
        if (!reviewAModificar){
            const response : ExpressResponse<Review> = {message: "Review  no encontrada", data: undefined}
            return res.status(404).send(response)
        }
        
        if (descripcion) reviewAModificar.descripcion = descripcion
        if (puntuacion) reviewAModificar.puntuacion = puntuacion
        await orm.em.flush()

        res.status(200).send({message:"Review modificada", data: reviewAModificar})
    } catch (error) {
        const response : ExpressResponse<Review> = {message: String(error), data: undefined}
        res.status(500).send(response)
    }
}

async function delete_(req: Request, res: Response){
    const _id =  req.params.id as string;

    try {
        const reviewABorrar = orm.em.getReference(Review, _id);
        
        if(!reviewABorrar){
            const response : ExpressResponse<Review> = {message: "Review no encontrada", data: undefined}
            return res.status(404).send(response)
        }

        await orm.em.remove(reviewABorrar).flush();
        const response : ExpressResponse<Review> = {message: "Review borrado", data: reviewABorrar}
        res.status(200).send(response)

    } catch (error) {
        const response : ExpressResponse<Review> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

export { add, delete_, findAll, findOne, modify };
