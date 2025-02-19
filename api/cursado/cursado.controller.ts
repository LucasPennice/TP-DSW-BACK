import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { MateriaController } from "../materia/materia.controller.js";
import { ProfesorController } from "../profesor/profesor.controller.js";
import { ExpressResponse_Migration } from "../shared/types.js";
import { Cursado } from "./cursado.entity.js";

export const primeraLetraMayuscula = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export class CursadoController {
    private em: MongoEntityManager<MongoDriver>;
    private materiaController: MateriaController;
    private profesorController: ProfesorController;

    findAll = async (): Promise<ExpressResponse_Migration<Cursado[]>> => {
        try {
            const cursados: Cursado[] | undefined = await this.em.findAll(Cursado, {
                populate: ["materia", "profesor", "reviews"],
            });

            await this.em.flush();

            let cursadosSinBorradoLogico = cursados.filter((c) => c.borradoLogico == false);

            return {
                message: "Found cursados successfully",
                data: cursadosSinBorradoLogico,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "There was an error finding the cursados",
                error: error instanceof Error ? error.message : "Unknown error",
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    findAllConBorrado = async (limit: number, offset: number): Promise<ExpressResponse_Migration<Cursado[]>> => {
        try {
            const [cursados, total] = await this.em.findAndCount(
                Cursado,
                {},
                {
                    populate: ["materia", "profesor", "reviews"],
                    limit,
                    offset,
                }
            );
            await this.em.flush();

            const totalPages = Math.ceil(total / limit);

            return {
                message: "Cursados found successfuly",
                data: cursados,
                totalPages: totalPages,
                success: true,
            };
        } catch (error) {
            return {
                message: "There was an error finding the cursados",
                error: error instanceof Error ? error.message : "Unknown error",
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    findOne = async (id: string): Promise<ExpressResponse_Migration<Cursado>> => {
        try {
            const cursado: Cursado | null = await this.em.findOne(Cursado, id, {
                populate: ["materia", "profesor", "reviews"],
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
                error: error instanceof Error ? error.message : "Unknown error",
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    add = async (
        newCursado: Omit<Cursado, "materia" | "profesor">,
        materiaId: string,
        profesorId: string
    ): Promise<ExpressResponse_Migration<Cursado>> => {
        const { diaCursado, horaInicio, horaFin, comision, turno, año, tipoCursado } = newCursado;

        try {
            const findMateriaReq = await this.materiaController.findOne(materiaId);

            if (!findMateriaReq.success || findMateriaReq.data?.borradoLogico == true) {
                return {
                    message: "Materia not found",
                    data: null,
                    totalPages: undefined,
                    success: false,
                };
            }

            const profReq = await this.profesorController.findOne(profesorId);

            if (!profReq.success || profReq.data!.borradoLogico == true)
                return {
                    message: "Profesor is not valid",
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
                if (cursado.año == año && cursado.diaCursado == diaCursado && !(horaFin < cursado.horaInicio || cursado.horaFin < horaInicio))
                    return true;

                return false;
            });

            if (cursadoSuperpuesto)
                return {
                    message: "This profesor already has a cursado in that day and time",
                    data: null,
                    success: false,
                    totalPages: undefined,
                };

            const nuevoCursado = new Cursado(diaCursado, horaInicio, horaFin, comision, turno, año, findMateriaReq.data!, profesor, tipoCursado);

            await this.em.persist(nuevoCursado).flush();

            return {
                message: "Cursado created successfully",
                data: null,
                success: false,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "There was an error finding the cursados",
                error: error instanceof Error ? error.message : "Unknown error",
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    modify = async (cursadoMod: Partial<Cursado>, cursadoId: string): Promise<ExpressResponse_Migration<Cursado>> => {
        try {
            const cursadoValidation = Cursado.schema.partial().safeParse(cursadoMod);

            if (!cursadoValidation.success)
                return {
                    message: "Error de validación",
                    error: `${cursadoValidation.error.errors}`,
                    success: false,
                    data: null,
                    totalPages: undefined,
                };

            const { diaCursado, horaInicio, horaFin, comision, turno, año, tipoCursado } = cursadoValidation.data;

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
                error: error instanceof Error ? error.message : "Unknown error",
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    delete_ = async (_id: string): Promise<ExpressResponse_Migration<Cursado>> => {
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

            let cantReviews = await cursadoABorrar.reviews.load();

            for (let index = 0; index < cantReviews.count(); index++) {
                cursadoABorrar.reviews[index].borradoLogico = true;
            }

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
                error: error instanceof Error ? error.message : "Unknown error",
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    buscarCursadosPorAtributos = async (comision: number, año: number, materiaId: string): Promise<ExpressResponse_Migration<Cursado[]>> => {
        try {
            const findMateriaReq = await this.materiaController.findOne(materiaId);

            if (!findMateriaReq.data) {
                throw new Error("Materia borrada");
            }

            const cursados: Cursado[] = await this.em.findAll(Cursado, {
                where: { comision, año, materia: findMateriaReq.data! },
                populate: ["materia", "profesor", "reviews"],
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
                error: error instanceof Error ? error.message : "Unknown error",
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
