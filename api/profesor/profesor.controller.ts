import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { Cursado } from "../cursado/cursado.entity.js";
import { dateFromString } from "../dateExtension.js";
import { MateriaController } from "../materia/materia.controller.js";
import { Review } from "../review/review.entity.js";
import { ExpressResponse } from "../shared/types.js";
import { Profesor } from "./profesor.entity.js";
import { errorToZod } from "../constants.js";
import { CursadoController } from "../cursado/cursado.controller.js";

export class ProfesorController {
    private em: MongoEntityManager<MongoDriver>;
    private materiaController: MateriaController;

    findAll = async (): Promise<ExpressResponse<Profesor[]>> => {
        try {
            const profesoresSinBorradoLogico: Profesor[] | undefined = await this.em.findAll(Profesor, {
                populate: ["*"],
                where: { borradoLogico: false },
            });

            await this.em.flush();

            return {
                message: "Profesores encontrados:",
                data: profesoresSinBorradoLogico,
                totalPages: undefined,
                success: true,
            };
        } catch (error) {
            return {
                message: "Error finding the profesores",
                data: null,
                success: false,
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                totalPages: undefined,
            };
        }
    };

    findAllConBorrado = async (limit: number, offset: number): Promise<ExpressResponse<Profesor[]>> => {
        try {
            const [profesores, total] = await this.em.findAndCount(
                Profesor,
                {},
                {
                    populate: ["*"],
                    limit,
                    offset,
                }
            );

            await this.em.flush();

            const totalPages = Math.ceil(total / limit);

            return {
                message: "Profesores encontrados:",
                data: profesores,
                totalPages: totalPages,
                success: true,
            };
        } catch (error) {
            return {
                message: "Error finding the profesores",
                data: null,
                success: false,
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                totalPages: undefined,
            };
        }
    };

    findOne = async (_id: string): Promise<ExpressResponse<Profesor>> => {
        try {
            const profesor: Profesor | null = await this.em.findOne(Profesor, _id, {
                populate: ["*"],
            });

            await this.em.flush();

            if (!profesor)
                return {
                    message: "Profesor no encontrado",
                    data: null,
                    success: true,
                    totalPages: undefined,
                };

            return {
                message: "Profesor encontrado",
                data: profesor,
                totalPages: undefined,
                success: true,
            };
        } catch (error) {
            return {
                message: "Error finding the areas",
                data: null,
                success: false,
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                totalPages: undefined,
            };
        }
    };

    add = async (newProfesor: Profesor): Promise<ExpressResponse<Profesor>> => {
        try {
            const { nombre, apellido, fechaNacimiento, dni, sexo } = newProfesor;

            const nuevoProfesor = new Profesor(nombre, apellido, fechaNacimiento, dni, 0, sexo);

            await this.em.persistAndFlush(nuevoProfesor);

            return {
                message: "Profesor creado",
                data: nuevoProfesor,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "Error finding the areas",
                data: null,
                success: false,
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                totalPages: undefined,
            };
        }
    };

    modify = async (profesorMod: Partial<Omit<Profesor, "puntuacionGeneral">>, profesorId: string): Promise<ExpressResponse<Profesor>> => {
        const { nombre, apellido, fechaNacimiento, dni, sexo } = profesorMod;

        try {
            const profesorAModificar = this.em.getReference(Profesor, profesorId);

            if (!profesorAModificar)
                return {
                    message: "Profesor no encontrado",
                    data: null,
                    success: true,
                    totalPages: undefined,
                };

            if (fechaNacimiento) profesorAModificar.fechaNacimiento = fechaNacimiento;
            if (nombre) profesorAModificar.nombre = nombre;
            if (apellido) profesorAModificar.apellido = apellido;
            if (dni) profesorAModificar.dni = dni;
            if (sexo) {
                profesorAModificar.sexo = sexo;
            }

            await this.em.flush();

            return {
                message: "Profesor modificado",
                data: profesorAModificar,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "Error finding the areas",
                data: null,
                success: false,
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                totalPages: undefined,
            };
        }
    };

    delete_ = async (_id: string): Promise<ExpressResponse<Profesor>> => {
        try {
            const finProfReq = await this.findOne(_id);

            if (!finProfReq.success)
                return {
                    message: "Error finding the profesor",
                    data: null,
                    success: false,
                    error: finProfReq.error,
                    totalPages: undefined,
                };

            const profesorABorrar = finProfReq.data!;

            profesorABorrar.borradoLogico = true;
            //@ts-ignore

            const ids = (await profesorABorrar.cursados.load({ populate: ["_id"] })).toArray().map((x) => x.id);
            const cursadoController = new CursadoController(this.em);
            ids.forEach(async (id) => {
                await cursadoController.delete_(id);
            });

            await this.em.flush();

            return {
                message: "Profesor borrado",
                data: profesorABorrar,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "Error deleting profesor",
                data: null,
                success: false,
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                totalPages: undefined,
            };
        }
    };

    findReviews = async (_id: string): Promise<ExpressResponse<Review[]>> => {
        try {
            const finProfReq = await this.findOne(_id);

            if (!finProfReq.success)
                return {
                    message: "Error finding the profesor",
                    data: null,
                    success: false,
                    error: finProfReq.error,
                    totalPages: undefined,
                };

            const profesor = finProfReq.data!;

            const cursados = profesor.cursados.map((c) => c._id);

            const reviews: Review[] = await this.em.find(Review, {
                cursado: { $in: cursados.map((cursado) => cursado) },
            });

            await this.em.flush();

            return {
                message: "Reviews Encontradas",
                data: reviews,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "Error finding the areas",
                data: null,
                success: false,
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                totalPages: undefined,
            };
        }
    };

    findPorMateriaYAnoYAnoCursado = async (_idMateria: string, anoMateria: number, anoCursado: number): Promise<ExpressResponse<Profesor[]>> => {
        try {
            const findMateriaReq = await this.materiaController.findOne(_idMateria);

            if (!findMateriaReq.success || findMateriaReq.data!.borradoLogico == true) {
                throw new Error("Materia borrado");
            }

            const cursados: Cursado[] = await this.em.findAll(Cursado, {
                populate: ["*"],
                where: {
                    borradoLogico: false,
                    materia: { _id: _idMateria },
                    año: anoCursado,
                    comision: { $gte: anoMateria * 100, $lt: (anoMateria + 1) * 100 },
                },
            });

            const idsProf = cursados.map((c) => c.profesor._id);

            const resultado: Profesor[] = await this.em.findAll(Profesor, {
                populate: ["*"],
                where: {
                    _id: { $in: idsProf },
                    borradoLogico: false,
                },
            });

            await this.em.flush();

            return {
                message: "Profesores Encontradas",
                data: resultado,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "Error finding the areas",
                data: null,
                success: false,
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                totalPages: undefined,
            };
        }
    };

    findPorMateriaYAno = async (_idMateria: string, anoMateria: number): Promise<ExpressResponse<Profesor[]>> => {
        try {
            const findMateriaReq = await this.materiaController.findOne(_idMateria);

            if (!findMateriaReq.success || findMateriaReq.data!.borradoLogico == true) {
                throw new Error("Materia borrado");
            }

            const cursados: Cursado[] = await this.em.findAll(Cursado, {
                populate: ["*"],
                where: {
                    borradoLogico: false,
                    materia: { _id: _idMateria },
                    comision: { $gte: anoMateria * 100, $lt: (anoMateria + 1) * 100 },
                },
            });

            const idsProf = cursados.map((c) => c.profesor._id);

            const resultado: Profesor[] = await this.em.findAll(Profesor, {
                populate: ["*"],
                where: {
                    _id: { $in: idsProf },
                    borradoLogico: false,
                },
            });

            await this.em.flush();

            return {
                message: "Profesores Encontradas",
                data: resultado,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "Error finding the areas",
                data: null,
                success: false,
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                totalPages: undefined,
            };
        }
    };

    findReviewsPorMateria = async (_id: string, _idMateria: string): Promise<ExpressResponse<Review[]>> => {
        try {
            const finProfReq = await this.findOne(_id);

            if (!finProfReq.success)
                return {
                    message: "Error finding the profesor",
                    data: null,
                    success: false,
                    error: finProfReq.error,
                    totalPages: undefined,
                };

            const profesor = finProfReq.data!;

            if (!profesor) {
                throw new Error("Profesor borrado");
            }

            const cursados = profesor.cursados.filter((c) => c.materia._id == _idMateria).map((c) => c._id);

            const reviews: Review[] = await this.em.find(Review, {
                cursado: { $in: cursados.map((cursado) => cursado) },
            });

            await this.em.flush();

            return {
                message: "Reviews Encontradas",
                data: reviews,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "Error finding the areas",
                data: null,
                success: false,
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                totalPages: undefined,
            };
        }
    };

    constructor(em: MongoEntityManager<MongoDriver>) {
        this.em = em;
        this.materiaController = new MateriaController(em);
    }
}
