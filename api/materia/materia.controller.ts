import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { AreaController } from "../area/area.controller.js";
import { ExpressResponse_Migration } from "../shared/types.js";
import { Materia } from "./materia.entity.js";

export class MateriaController {
    private em: MongoEntityManager<MongoDriver>;
    private areaController: AreaController;

    findAll = async (): Promise<ExpressResponse_Migration<Materia[]>> => {
        try {
            const materias = await this.em.findAll(Materia, {
                populate: ["*"],
            });

            await this.em.flush();

            let materiasSinBorradoLogico = materias.filter((m) => m.borradoLogico == false);

            return {
                message: "Materias Encontradas",
                success: true,
                data: materiasSinBorradoLogico,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "There was an error in findAll materias",
                error: error instanceof Error ? error.message : "Unknown error",
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    findAllConBorrado = async (limit: number, offset: number): Promise<ExpressResponse_Migration<Materia[]>> => {
        try {
            const [materias, total] = await this.em.findAndCount(
                Materia,
                {},
                {
                    populate: ["area", "cursados"],
                    limit,
                    offset,
                }
            );

            await this.em.flush();

            const totalPages = Math.ceil(total / limit);

            return {
                message: "Materias Encontradas",
                success: true,
                data: materias,
                totalPages: totalPages,
            };
        } catch (error) {
            return {
                message: "There was an error in findAllConBorrado materia",
                error: error instanceof Error ? error.message : "Unknown error",
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    findOne = async (id: string): Promise<ExpressResponse_Migration<Materia>> => {
        try {
            const materia: Materia | null = await this.em.findOne(Materia, id, {
                populate: ["area", "cursados"],
            });

            await this.em.flush();

            if (!materia)
                return {
                    message: "Materia no Encontrada",
                    success: true,
                    data: null,
                    totalPages: undefined,
                };

            return {
                success: true,
                message: "Materia Encontrada",
                data: materia,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "There was an error in findOne materia",
                error: error instanceof Error ? error.message : "Unknown error",
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    add = async (newMateria: Omit<Materia, "area">, areaId: string): Promise<ExpressResponse_Migration<Materia>> => {
        try {
            const { nombre } = newMateria;

            const findAreaRes = await this.areaController.findOneArea(areaId);

            if (!findAreaRes.success || findAreaRes.data!.borradoLogico == true)
                return {
                    message: "Area not valid",
                    data: null,
                    success: false,
                    totalPages: undefined,
                };

            let materiasMatch: Materia[] = await this.em.findAll(Materia, { where: { nombre } });

            if (materiasMatch.length != 0) {
                throw new Error("Ya hay una materia con ese nombre");
            }

            const nuevaMateria = new Materia(nombre, findAreaRes.data!);

            return {
                message: "Materia created successfully",
                data: nuevaMateria,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "There was an error in add materia",
                error: error instanceof Error ? error.message : "Unknown error",
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    modify = async (materiaMod: Partial<Materia>, materiaId: string): Promise<ExpressResponse_Migration<Materia>> => {
        const materiaValidation = Materia.schema.partial().safeParse(materiaMod);

        if (!materiaValidation.success)
            return {
                message: "Error de validación",
                error: `${materiaValidation.error.errors}`,
                success: false,
                data: null,
                totalPages: undefined,
            };

        const { nombre } = materiaValidation.data;

        try {
            const materiaAModificar: Materia | undefined = this.em.getReference(Materia, materiaId);

            if (!materiaAModificar)
                return {
                    message: "Materia no encontrada",
                    error: "Materia no encontrada",
                    success: false,
                    data: null,
                    totalPages: undefined,
                };

            if (nombre) materiaAModificar.nombre = nombre;

            await this.em.flush();

            return {
                message: "Materia modificada",
                data: materiaAModificar,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "There was an error in modify materia",
                error: error instanceof Error ? error.message : "Unknown error",
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    delete_ = async (_id: string): Promise<ExpressResponse_Migration<Materia>> => {
        try {
            const materiaABorrarReq = await this.findOne(_id);

            if (!materiaABorrarReq.success)
                return {
                    message: "Materia no encontrada",
                    error: "Materia no encontrada",
                    success: false,
                    data: null,
                    totalPages: undefined,
                };

            const materiaABorrar = materiaABorrarReq.data!;

            materiaABorrar.borradoLogico = true;

            let cantCursados = await materiaABorrar.cursados.load();

            for (let index = 0; index < cantCursados.count(); index++) {
                materiaABorrar.cursados[index].borradoLogico = true;
            }

            await this.em.flush();

            return {
                message: "Materia Borrada",
                data: materiaABorrar,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "There was an error in delete materia",
                error: error instanceof Error ? error.message : "Unknown error",
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    findMateriasPorAno = async (_idAno: number): Promise<ExpressResponse_Migration<Materia[]>> => {
        try {
            const materias: Materia[] = await this.em.findAll(Materia, {
                populate: ["*"],
            });

            let resultado = materias.filter((m) => m.cursados.toArray().filter((x) => x.comision.toString()[0] == _idAno.toString()).length != 0);

            await this.em.flush();

            return {
                message: "Materias Encontradas",
                success: true,
                data: resultado,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "There was an error in findMateriasPorAño",
                error: error instanceof Error ? error.message : "Unknown error",
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    constructor(em: MongoEntityManager<MongoDriver>) {
        this.em = em;
        this.areaController = new AreaController(em);
    }
}
