import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { MateriaController } from "../materia/materia.controller.js";
import { ProfesorController } from "../profesor/profesor.controller.js";
import { ExpressResponse } from "../shared/types.js";
import { Cursado } from "./cursado.entity.js";
import { errorToZod } from "../constants.js";
import { ReviewController } from "../review/review.controller.js";

export const primeraLetraMayuscula = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export class CursadoController {
    private em: MongoEntityManager<MongoDriver>;
    private materiaController: MateriaController;
    private profesorController: ProfesorController;

    findAll = async (offset?: number, limit: number = 0, isDeleted: boolean = false): Promise<ExpressResponse<Cursado[]>> => {
        try {
            const [cursados, total] = await this.em.findAndCount(
                Cursado,
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
                message: "Cursados Encontradas",
                success: true,
                data: cursados,
                totalPages,
            };
        } catch (error) {
            return {
                message: "There was an error finding the cursados",
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    findOne = async (id: string): Promise<ExpressResponse<Cursado>> => {
        try {
            const cursado: Cursado | null = await this.em.findOne(Cursado, id, {
                populate: ["*"],
            });

            await this.em.flush();

            if (!cursado)
                return {
                    message: "Cursado not found",
                    data: null,
                    success: false,
                    totalPages: undefined,
                };

            return {
                message: "Cursado found successfully",
                data: cursado,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "There was an error finding the cursados",
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    add = async (
        newCursado: Omit<Cursado, "materia" | "profesor" | "reviews" | "_id" | "borradoLogico">,
        materiaId: string,
        profesorId: string
    ): Promise<ExpressResponse<Cursado>> => {
        const { diaCursado, horaInicio, horaFin, comision, turno, año, tipoCursado } = newCursado;

        try {
            const findMateriaReq = await this.materiaController.findOne(materiaId);

            if (!findMateriaReq.success || findMateriaReq.data?.borradoLogico == true) {
                return {
                    message: "Materia no valida",
                    data: null,
                    totalPages: undefined,
                    success: false,
                };
            }

            if (horaInicio >= horaFin) {
                return {
                    message: "Horarios no validos",
                    data: null,
                    totalPages: undefined,
                    success: false,
                };
            }

            const profReq = await this.profesorController.findOne(profesorId);

            if (!profReq.success || profReq.data!.borradoLogico == true)
                return {
                    message: "Profesor no valido",
                    data: null,
                    success: false,
                    totalPages: undefined,
                };

            const profesor = profReq.data!;

            const reqCursadoPorAtributos = await this.buscarCursadosPorAtributos(comision, año, findMateriaReq.data!._id);

            const matches = reqCursadoPorAtributos.data;

            if (!matches) {
                throw "Error buscando cursados por atributos";
            }

            // No me deja meter mas de dos cursados por Comision + Año + Materia
            if (matches.length >= 2) {
                throw new Error("Ya hay dos cursados para esa Comision + Año + Materia");
            }

            // No me deja poner dos profesores del mismo tipo
            if (matches.length != 0 && matches[0].tipoCursado == tipoCursado) {
                throw new Error(`Ya existe un profesor del tipo ${tipoCursado} en esa Comision + Año + Materia`);
            }

            const cursadoSuperpuesto = profesor.cursados.find((cursado) => {
                if (cursado.año == año && cursado.diaCursado == diaCursado && !(horaFin! < cursado.horaInicio || cursado.horaFin < horaInicio!))
                    return true;

                return false;
            });

            if (cursadoSuperpuesto)
                return {
                    message: "Este profesor ya tiene un Cursado en ese dia y hora",
                    data: null,
                    success: false,
                    totalPages: undefined,
                };

            const nuevoCursado = new Cursado(diaCursado, horaInicio, horaFin, comision, turno, año, findMateriaReq.data!, profesor, tipoCursado);

            await this.em.persistAndFlush(nuevoCursado);

            return {
                message: "Cursado created successfully",
                data: nuevoCursado,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "There was an error finding the cursados",
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    modify = async (cursadoMod: Partial<Cursado>, cursadoId: string): Promise<ExpressResponse<Cursado>> => {
        try {
            const { diaCursado, horaInicio, horaFin, comision, turno, año, tipoCursado } = cursadoMod;

            const cursadoAModificar = this.em.getReference(Cursado, cursadoId);

            if (!cursadoAModificar)
                return {
                    message: "Cursado no encontrada",
                    success: false,
                    data: null,
                    totalPages: undefined,
                };

            if (cursadoAModificar) {
                if (diaCursado) cursadoAModificar.diaCursado = diaCursado;
                if (horaInicio) cursadoAModificar.horaInicio = horaInicio;
                if (horaFin) cursadoAModificar.horaFin = horaFin;
                if (comision) cursadoAModificar.comision = comision;
                if (turno) cursadoAModificar.turno = turno;
                if (año) cursadoAModificar.año = año;
                if (tipoCursado) cursadoAModificar.tipoCursado = tipoCursado;
            }

            await this.em.flush();

            return {
                message: "Cursado modificada",
                data: cursadoAModificar,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "There was an error modifying the cursados",
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    delete_ = async (_id: string): Promise<ExpressResponse<Cursado>> => {
        try {
            const findCursadoReq = await this.findOne(_id);

            const cursadoABorrar = findCursadoReq.data;

            if (!cursadoABorrar)
                return {
                    message: "Cursado no encontrado",
                    data: null,
                    success: false,
                    totalPages: undefined,
                };

            cursadoABorrar.borradoLogico = true;

            //@ts-ignore
            const ids = (await cursadoABorrar.reviews.load({ populate: ["_id"] })).toArray().map((x) => x.id);
            const reviewController = new ReviewController(this.em);
            ids.forEach(async (id) => {
                await reviewController.delete_(id);
            });

            await this.em.flush();

            return {
                message: "Cursado Borrado",
                data: cursadoABorrar,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "There was an error deleting the cursado",
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    buscarCursadosPorAtributos = async (comision: number, año: number, materiaId: string): Promise<ExpressResponse<Cursado[]>> => {
        try {
            const findMateriaReq = await this.materiaController.findOne(materiaId);

            if (!findMateriaReq.data) {
                throw new Error("Materia borrada");
            }

            const cursados: Cursado[] = await this.em.findAll(Cursado, {
                where: { comision, año, materia: findMateriaReq.data! },
                populate: ["*"],
            });

            await this.em.flush();

            return {
                message: "Cursados encontrados",
                data: cursados,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "There was an finding the cursado",
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };
    constructor(em: MongoEntityManager<MongoDriver>) {
        this.em = em;
        this.materiaController = new MateriaController(em);
        this.profesorController = new ProfesorController(em);
    }
}
