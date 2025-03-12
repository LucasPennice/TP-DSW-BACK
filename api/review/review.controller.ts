import { ExpressResponse } from "../shared/types.js";
import { Review } from "./review.entity.js";
//@ts-ignore
import profanity from "bad-words-es";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { ProfesorController } from "../profesor/profesor.controller.js";
import { Cursado } from "../cursado/cursado.entity.js";
import { UsuarioController } from "../usuario/usuario.controller.js";
import { errorToZod } from "../constants.js";

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

export class ReviewController {
    private em: MongoEntityManager<MongoDriver>;
    private profesorController: ProfesorController;
    private usuarioController: UsuarioController;

    findAll = async (offset?: number, limit: number = 0, isDeleted: boolean = false): Promise<ExpressResponse<Review[]>> => {
        try {
            const [reviews, total] = await this.em.findAndCount(
                Review,
                { $or: [{ borradoLogico: isDeleted }, { borradoLogico: false }] },
                {
                    populate: ["*"],
                    limit,
                    offset,
                }
            );

            await this.em.flush();

            const boundLimit = limit <= 0 ? 1 : limit;
            const totalPages = limit === 0 ? undefined : Math.ceil(total / boundLimit);

            return {
                message: "Reviews Encontradas",
                success: true,
                data: reviews,
                totalPages,
            };
        } catch (error) {
            return {
                message: "Error finding the reviews",
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    findOne = async (_id: string): Promise<ExpressResponse<Review>> => {
        try {
            const review: Review | null = await this.em.findOne(Review, _id, {
                populate: ["*"],
            });

            await this.em.flush();

            if (!review)
                return {
                    message: "Review no encontrada",
                    success: false,
                    data: null,
                    totalPages: undefined,
                };

            return {
                message: "Review encontrada",
                success: true,
                data: review,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "Error finding the review",
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    add = async (
        reviewData: Omit<Review, "usuario" | "cursado" | "fecha" | "_id" | "borradoLogico" | "censurada">,
        profesorId: string,
        materiaId: string,
        anoCursado: number,
        anio: number,
        userId: string
    ): Promise<ExpressResponse<Review>> => {
        try {
            // Encontrar el Cursado
            const fork = this.em.fork();
            //@ts-ignore
            const cursado: Cursado | null = await fork.findOne(Cursado, {
                profesor: { _id: profesorId },
                materia: { _id: materiaId },
                comision: { $gte: anio * 100, $lt: (anio + 1) * 100 },
                año: anoCursado,
            });

            if (!cursado || cursado.borradoLogico == true)
                return {
                    message: "Cursado no Válido",
                    data: null,
                    success: false,
                    totalPages: undefined,
                };

            const findUserReq = await this.usuarioController.findOne(userId);

            if (!findUserReq.success)
                return {
                    message: "Usuario no encontrado",
                    data: null,
                    success: false,
                    totalPages: undefined,
                };

            const reviewLimpia = filter.clean(reviewData.descripcion);
            const censurada = reviewLimpia != reviewData.descripcion;

            const newReview = new Review(reviewLimpia, reviewData.puntuacion, findUserReq.data!, cursado, censurada);
            await this.em.persistAndFlush(newReview);

            const profReq = await this.profesorController.findOne(profesorId);

            if (profReq.success) {
                profReq.data!.puntuacionGeneral =
                    (profReq.data!.puntuacionGeneral * profReq.data!.reviewsRecibidas + newReview.puntuacion) / (profReq.data!.reviewsRecibidas + 1);
                profReq.data!.reviewsRecibidas = profReq.data!.reviewsRecibidas + 1;

                await this.em.flush();
            }

            return {
                message: "Review creada",
                success: true,
                data: newReview,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "Error adding the review",
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    modify = async (reviewMod: Partial<Review>, reviewId: string): Promise<ExpressResponse<Review>> => {
        try {
            const reviewAModificar = this.em.getReference(Review, reviewId);

            if (!reviewAModificar)
                return {
                    message: "Review no encontrada",
                    data: null,
                    success: false,
                    totalPages: undefined,
                };

            if (reviewMod.descripcion) reviewAModificar.descripcion = reviewMod.descripcion;
            if (reviewMod.puntuacion) reviewAModificar.puntuacion = reviewMod.puntuacion;

            await this.em.flush();

            return {
                message: "Review modificada",
                data: reviewAModificar,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "Error modifying the reviews",
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    delete_ = async (_id: string): Promise<ExpressResponse<Review>> => {
        try {
            const reviewReq = await this.findOne(_id);

            if (!reviewReq.success)
                return {
                    message: "Review no encontrada",
                    data: null,
                    success: false,
                    totalPages: undefined,
                };

            const reviewABorrar = reviewReq.data!;

            reviewABorrar.usuario.reviewsEliminadas.push({ id: reviewABorrar._id, mensaje: reviewABorrar.descripcion, visto: false });

            reviewABorrar.borradoLogico = true;

            await this.em.flush();

            return {
                message: "Review eliminada",
                data: reviewABorrar,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "Error finding the reviews",
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    constructor(em: MongoEntityManager<MongoDriver>) {
        this.em = em;
        this.profesorController = new ProfesorController(em);
        this.usuarioController = new UsuarioController(em);
    }
}
