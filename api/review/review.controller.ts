import { Request, Response } from "express";
import { Cursado } from "../cursado/cursado.entity.js";
import { ExpressResponse } from "../shared/types.js";
import { Usuario } from "../usuario/usuario.entity.js";
import { Review } from "./review.entity.js";
//@ts-ignore
import profanity from "bad-words-es";

import { z } from "zod";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { UsuarioController } from "../usuario/usuario.controller.js";
import { ProfesorController } from "../profesor/profesor.controller.js";

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

const reviewSchema = z.object({
    descripcion: z.string().min(1, "La descripcion es obligatoria"),
    puntuacion: z.number().refine((value) => value >= 0 && value <= 5, {
        message: "El puntaje debe estar entre 0-5",
    }),
    usuarioId: z.string().min(1, "El id de usuario es requerido"),
    profesorId: z.string().min(1, "El id de profesor es requerido"),
    materiaId: z.string().min(1, "El id de materia es requerido"),
    anio: z.string().min(1, "El año es requerido requerido"),
    anoCursado: z.number().min(1, { message: "El año de cursado es requerido" }),
});

export class ReviewController {
    private em: MongoEntityManager<MongoDriver>;
    private usuarioController: UsuarioController;
    private profesorController: ProfesorController;

    findAll = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const [reviews, total] = await this.em.findAndCount(
                Review,
                {},
                {
                    populate: ["*"],
                    limit,
                    offset,
                }
            );
            await this.em.flush();

            const totalPages = Math.ceil(total / limit);

            let reviewsSinBorradoLogico = reviews.filter((r) => r.borradoLogico == false);

            const reponse: ExpressResponse<Review[]> = {
                message: "Reviews encontradas:",
                data: reviewsSinBorradoLogico,
                totalPages: totalPages,
            };
            res.json(reponse);
        } catch (error) {
            const response: ExpressResponse<Review> = {
                message: String(error),
                data: undefined,
                totalPages: undefined,
            };
            res.status(500).send(response);
        }
    };

    findAllConBorrado = async (req: Request, res: Response) => {
        try {
            const reviews: Review[] | undefined = await this.em.findAll(Review, {
                populate: ["*"],
            });

            await this.em.flush();

            const reponse: ExpressResponse<Review[]> = {
                message: "Reviews encontradas:",
                data: reviews,
                totalPages: undefined,
            };
            res.json(reponse);
        } catch (error) {
            const response: ExpressResponse<Review> = {
                message: String(error),
                data: undefined,
                totalPages: undefined,
            };
            res.status(500).send(response);
        }
    };

    findOne = async (req: Request, res: Response) => {
        const _id = req.params.id;

        try {
            const review: Review | null = await this.em.findOne(Review, _id, {
                populate: ["*"],
            });

            await this.em.flush();
            if (!review) {
                const response: ExpressResponse<Review> = {
                    message: "Review no encontrada",
                    data: undefined,
                    totalPages: undefined,
                };
                return res.status(404).send(response);
            }
            res.json({ data: review });
        } catch (error) {
            const response: ExpressResponse<Review> = {
                message: String(error),
                data: undefined,
                totalPages: undefined,
            };
            res.status(500).send(response);
        }
    };

    add = async (req: Request, res: Response) => {
        const reviewValidation = reviewSchema.safeParse(req.body);

        if (!reviewValidation.success) {
            return res.status(400).send({
                message: "Error de validación",
                errors: reviewValidation.error.errors,
            });
        }

        // const { descripcion, puntuacion, usuarioId, materiaId, profesorId } = reviewValidation.data;
        const descripcion = req.body.descripcion as string;
        const puntuacion = req.body.puntuacion as number;
        const usuarioId = req.body.usuarioId as string;
        const anio = parseInt(req.body.anio) as number;
        const profesorId = req.body.profesorId as string;
        const materiaId = req.body.materiaId as string;
        const anoCursado = parseInt(req.body.anoCursado) as number;

        const reviewLimpia = filter.clean(descripcion);
        const censurada = reviewLimpia != descripcion;

        // 🚨 VALIDAR CON ZOD 🚨

        const usuario: Usuario | null = await this.usuarioController.findOneUsuario(usuarioId);

        if (!usuario || usuario.borradoLogico == true) {
            const response: ExpressResponse<Usuario> = {
                message: "Usuario no Válido",
                data: undefined,
                totalPages: undefined,
            };
            return res.status(404).send(response);
        }

        //@ts-ignore
        const cursado: Cursado | null = await this.em.findOne(Cursado, {
            profesor: { _id: profesorId },
            materia: { _id: materiaId },
            comision: { $gte: anio * 100, $lt: (anio + 1) * 100 },
            año: anoCursado,
        });

        if (!cursado || cursado.borradoLogico == true) {
            const response: ExpressResponse<Usuario> = {
                message: "Cursado no Válido",
                data: undefined,
                totalPages: undefined,
            };
            return res.status(404).send(response);
        }

        const nuevaReview = new Review(reviewLimpia, puntuacion, usuario, cursado, censurada);

        try {
            await this.em.persist(nuevaReview).flush();
            const response: ExpressResponse<Review> = {
                message: "Review creada",
                data: nuevaReview,
                totalPages: undefined,
            };

            /// Actualizar el promedio de calificacion del profesor

            let profesor = await this.profesorController.findOneProfesor(profesorId);

            if (profesor) {
                profesor.puntuacionGeneral =
                    (profesor.puntuacionGeneral * profesor.reviewsRecibidas + nuevaReview.puntuacion) / (profesor.reviewsRecibidas + 1);
                profesor.reviewsRecibidas = profesor.reviewsRecibidas + 1;

                await this.em.flush();
            }

            res.status(201).send(response);
        } catch (error) {
            const response: ExpressResponse<Review> = {
                message: String(error),
                data: undefined,
                totalPages: undefined,
            };
            res.status(500).send(response);
        }
    };

    modify = async (req: Request, res: Response) => {
        const _id = req.params.id as string;
        const descripcion = req.body.descripcion as string;
        const puntuacion = req.body.puntuacion as number;

        const reviewValidation = reviewSchema.partial().safeParse(req.body);

        if (!reviewValidation.success) {
            return res.status(400).send({
                message: "Error de validación",
                errors: reviewValidation.error.errors,
            });
        }

        try {
            const reviewAModificar = this.em.getReference(Review, _id);

            if (!reviewAModificar) {
                const response: ExpressResponse<Review> = {
                    message: "Review  no encontrada",
                    data: undefined,
                    totalPages: undefined,
                };
                return res.status(404).send(response);
            }

            if (descripcion) reviewAModificar.descripcion = descripcion;
            if (puntuacion) reviewAModificar.puntuacion = puntuacion;
            await this.em.flush();

            res.status(200).send({ message: "Review modificada", data: reviewAModificar });
        } catch (error) {
            const response: ExpressResponse<Review> = {
                message: String(error),
                data: undefined,
                totalPages: undefined,
            };
            res.status(500).send(response);
        }
    };

    delete_ = async (req: Request, res: Response) => {
        const _id = req.params.id as string;

        try {
            const reviewABorrar = this.em.getReference(Review, _id);

            if (!reviewABorrar) {
                const response: ExpressResponse<Review> = {
                    message: "Review no encontrada",
                    data: undefined,
                    totalPages: undefined,
                };
                return res.status(404).send(response);
            }

            reviewABorrar.borradoLogico = true;
            await this.em.flush();

            const response: ExpressResponse<Review> = {
                message: "Review borrado",
                data: reviewABorrar,
                totalPages: undefined,
            };
            res.status(200).send(response);
        } catch (error) {
            const response: ExpressResponse<Review> = {
                message: String(error),
                data: undefined,
                totalPages: undefined,
            };
            res.status(500).send(response);
        }
    };

    constructor(em: MongoEntityManager<MongoDriver>) {
        this.em = em;
        this.usuarioController = new UsuarioController(em);
        this.profesorController = new ProfesorController(em);
    }
}
