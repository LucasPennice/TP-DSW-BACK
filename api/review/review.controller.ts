import { Request, Response } from "express";
import { findOneCursado } from "../cursado/cursado.controller.js";
import { Cursado } from "../cursado/cursado.entity.js";
import { orm } from "../orm.js";
import { ExpressResponse } from "../shared/types.js";
import { findOneUsuario } from "../usuario/usuario.controller.js";
import { Usuario } from "../usuario/usuario.entity.js";
import { Review } from "./review.entity.js";
//@ts-ignore
import profanity from "bad-words-es";
import { helpers as profesorHelpers } from "../profesor/profesor.controller.js";

var filter = new profanity({ languages: ["es"] });

filter.addWords(
    "boludo",
    "boluda",
    "pelotudo",
    "pelotuda",
    "forro",
    "forra",
    "ganso",
    "gansa",
    "mogolico",
    "mogolica",
    "mogólico",
    "mogólica",
    "choto",
    "chota",
    "gil",
    "ñoqui",
    "noqui",
    "puto",
    "puta",
    "tarado",
    "tarada",
    "vago",
    "vaga",
    "estupido",
    "estupida",
    "estúpido",
    "estúpida",
    "idiota",
    "imbecil",
    "imbécil",
    "pajero",
    "pajera",
    "cagon",
    "cagona",
    "cagón",
    "cagona",
    "chupamedias",
    "alcahuete",
    "alcahueta",
    "cornudo",
    "cornuda",
    "facho",
    "facha",
    "bolacero",
    "bolacera",
    "pija",
    "poronga",
    "sorete"
);

async function findAll(req: Request, res: Response) {
    try {
        const reviews: Review[] | undefined = await orm.em.findAll(Review, {
            populate: ["*"],
        });

        await orm.em.flush();

        let reviewsSinBorradoLogico = reviews.filter((r) => r.borradoLogico == false);

        const reponse: ExpressResponse<Review[]> = { message: "Reviews encontradas:", data: reviewsSinBorradoLogico };
        res.json(reponse);
    } catch (error) {
        const response: ExpressResponse<Review> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function findAllConBorrado(req: Request, res: Response) {
    try {
        const reviews: Review[] | undefined = await orm.em.findAll(Review, {
            populate: ["*"],
        });

        await orm.em.flush();

        const reponse: ExpressResponse<Review[]> = { message: "Reviews encontradas:", data: reviews };
        res.json(reponse);
    } catch (error) {
        const response: ExpressResponse<Review> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function findOne(req: Request, res: Response) {
    const _id = req.params.id;

    try {
        const review: Review | null = await orm.em.findOne(Review, _id, {
            populate: ["*"],
        });

        await orm.em.flush();
        if (!review) {
            const response: ExpressResponse<Review> = { message: "Review no encontrada", data: undefined };
            return res.status(404).send(response);
        }
        res.json({ data: review });
    } catch (error) {
        const response: ExpressResponse<Review> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function add(req: Request, res: Response) {
    const descripcion = req.body.descripcion as string;
    const puntuacion = req.body.puntuacion as number;
    const usuarioId = req.body.usuarioId as string;
    const anio = req.body.anio as string;
    const profesorId = req.body.profesorId as string;
    const materiaId = req.body.materiaId as string;

    const reviewLimpia = filter.clean(descripcion);
    const censurada = reviewLimpia != descripcion;

    // 🚨 VALIDAR CON ZOD 🚨

    const usuario: Usuario | null = await findOneUsuario(usuarioId);

    if (!usuario || usuario.borradoLogico == true) {
        const response: ExpressResponse<Usuario> = { message: "Usuario no Válido", data: undefined };
        return res.status(404).send(response);
    }

    //@ts-ignore
    const cursado: Cursado | null = await orm.em.findOne(Cursado, {
        profesor: { _id: profesorId },
        materia: { _id: materiaId },
        comision: { $re: new RegExp(`^${anio}`) },
    });

    if (!cursado || cursado.borradoLogico == true) {
        const response: ExpressResponse<Usuario> = { message: "Cursado no Válido", data: undefined };
        return res.status(404).send(response);
    }

    const nuevaReview = new Review(reviewLimpia, puntuacion, usuario, cursado, censurada);

    try {
        await orm.em.persist(nuevaReview).flush();
        const response: ExpressResponse<Review> = { message: "Review creada", data: nuevaReview };

        /// Actualizar el promedio de calificacion del profesor

        let profesor = await profesorHelpers.findOneProfesor(profesorId);

        if (profesor) {
            profesor.puntuacionGeneral =
                (profesor.puntuacionGeneral * profesor.reviewsRecibidas + nuevaReview.puntuacion) / (profesor.reviewsRecibidas + 1);
            profesor.reviewsRecibidas = profesor.reviewsRecibidas + 1;

            await orm.em.flush();
        }

        res.status(201).send(response);
    } catch (error) {
        const response: ExpressResponse<Review> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function modify(req: Request, res: Response) {
    const _id = req.params.id as string;

    const descripcion = req.body.descripcion as string;
    const puntuacion = req.body.puntuacion as number;

    try {
        const reviewAModificar = orm.em.getReference(Review, _id);

        if (!reviewAModificar) {
            const response: ExpressResponse<Review> = { message: "Review  no encontrada", data: undefined };
            return res.status(404).send(response);
        }

        if (descripcion) reviewAModificar.descripcion = descripcion;
        if (puntuacion) reviewAModificar.puntuacion = puntuacion;
        await orm.em.flush();

        res.status(200).send({ message: "Review modificada", data: reviewAModificar });
    } catch (error) {
        const response: ExpressResponse<Review> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function delete_(req: Request, res: Response) {
    const _id = req.params.id as string;

    try {
        const reviewABorrar = orm.em.getReference(Review, _id);

        if (!reviewABorrar) {
            const response: ExpressResponse<Review> = { message: "Review no encontrada", data: undefined };
            return res.status(404).send(response);
        }

        reviewABorrar.borradoLogico = true;
        await orm.em.flush();

        const response: ExpressResponse<Review> = { message: "Review borrado", data: reviewABorrar };
        res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Review> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

export { add, delete_, findAll, findAllConBorrado, findOne, modify };
