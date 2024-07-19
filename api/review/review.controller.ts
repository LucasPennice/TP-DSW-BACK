import { Request, Response } from "express";
import { Review } from "./review.entity.js";
import { ReviewRepository } from "./review.repository.js";
import { ExpressResponse } from "../shared/types.js";

const repository = new ReviewRepository()

type _Body = Partial<Review>

async function findAll(req: Request, res: Response){
    try {
        const response : Review[] | undefined = await repository.findAll()

        const reponse : ExpressResponse<Review[]> = {message: "Reviews encontradas:", data: response}
        res.json(reponse)
    } catch (error) {
        const response : ExpressResponse<Review> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

async function findOne(req: Request, res: Response){
    const _id =  req.params.id 
 
    try {
        const review : Review | undefined = await repository.findOne({_id})
    
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

    // 🚨 VALIDAR CON ZOD 🚨
    
    const nuevaReview = new Review(descripcion, puntuacion)

    try {
        const response : ExpressResponse<Review> = {message: "Review creada", data: await repository.add(nuevaReview)}
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

    
    const body: _Body ={
        descripcion: descripcion,
        puntuacion: puntuacion
    }

    try {
        const profesorModificado = await repository.update({_id}, body)
        
        if (!profesorModificado){
            const response : ExpressResponse<Review> = {message: "Review  no encontrada", data: undefined}
            return res.status(404).send(response)
        }
        
        res.status(200).send({message:"Review modificada", data: profesorModificado})
    } catch (error) {
        const response : ExpressResponse<Review> = {message: String(error), data: undefined}
        res.status(500).send(response)
    }
}

async function delete_(req: Request, res: Response){
    const _id =  req.params.id as string;

    try {
        const reviewBorrada = await repository.delete({_id})
        
        if(!reviewBorrada){
            const response : ExpressResponse<Review> = {message: "Review no encontrado", data: undefined}
            return res.status(404).send(response)
        }

        const response : ExpressResponse<Review> = {message: "Review borrado", data: reviewBorrada}
        res.status(200).send(response)

    } catch (error) {
        const response : ExpressResponse<Review> = {message: String(error), data: undefined}
        res.status(500).send(response)   
    }
}

export { add, delete_, findAll, findOne, modify };
