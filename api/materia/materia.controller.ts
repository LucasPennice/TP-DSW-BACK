import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { AreaController } from "../area/area.controller.js";
import { ExpressResponse } from "../shared/types.js";
import { Materia } from "./materia.entity.js";
import { errorToZod } from "../constants.js";
import { CursadoController } from "../cursado/cursado.controller.js";

export class MateriaController {
    private em: MongoEntityManager<MongoDriver>;
    private areaController: AreaController;

    findAll = async (offset?: number, limit: number = 0, isDeleted: boolean = false): Promise<ExpressResponse<Materia[]>> => {
        try {
            const [materias, total] = await this.em.findAndCount(
                Materia,
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
                message: "Materias Encontradas",
                success: true,
                data: materias,
                totalPages,
            };
        } catch (error) {
            return {
                message: "There was an error in findAll materias",
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    findOne = async (id: string): Promise<ExpressResponse<Materia>> => {
        try {
            const materia: Materia | null = await this.em.findOne(Materia, id, {
                populate: ["*"],
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
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    add = async (newMateria: Omit<Materia, "area" | "cursados" | "_id" | "borradoLogico">, areaId: string): Promise<ExpressResponse<Materia>> => {
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
            this.em.persistAndFlush(nuevaMateria);

            return {
                message: "Materia created successfully",
                data: nuevaMateria,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "There was an error in add materia",
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    modify = async (materiaMod: Partial<Materia>, materiaId: string): Promise<ExpressResponse<Materia>> => {
        try {
            const materiaAModificar: Materia | undefined = this.em.getReference(Materia, materiaId);

            if (!materiaAModificar)
                return {
                    message: "Materia no encontrada",

                    success: false,
                    data: null,
                    totalPages: undefined,
                };

            if (materiaMod.nombre) materiaAModificar.nombre = materiaMod.nombre;

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
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    private _delete_ = async (_id: string): Promise<ExpressResponse<Materia>> => {
        try {
            const materiaABorrarReq = await this.findOne(_id);

            if (!materiaABorrarReq.success)
                return {
                    message: "Materia no encontrada",

                    success: false,
                    data: null,
                    totalPages: undefined,
                };

            const materiaABorrar = materiaABorrarReq.data!;

            materiaABorrar.borradoLogico = true;
            //@ts-ignore
            const ids = (await materiaABorrar.cursados.load({ populate: ["_id"] })).toArray().map((x) => x.id);
            const cursadoController = new CursadoController(this.em);
            ids.forEach(async (id) => {
                await cursadoController.delete_(id);
            });

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
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };
    public get delete_() {
        return this._delete_;
    }
    public set delete_(value) {
        this._delete_ = value;
    }

    findMateriasPorAno = async (_idAno: number): Promise<ExpressResponse<Materia[]>> => {
        try {
            const findAllMateriasReq = await this.findAll();

            if (!findAllMateriasReq.success) return { ...findAllMateriasReq, message: "No se econtraron materias" };

            const materias = findAllMateriasReq.data!;

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
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
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
