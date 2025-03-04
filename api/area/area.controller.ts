import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { ExpressResponse_Migration } from "../shared/types.js";
import { Area } from "./area.entity.js";
import { MateriaController } from "../materia/materia.controller.js";
import { errorToZod } from "../constants.js";

export class AreaController {
    private static instance: AreaController;
    private em: MongoEntityManager<MongoDriver>;

    private constructor(em: MongoEntityManager<MongoDriver>) {
        this.em = em;
    }

    public static getInstance(em: MongoEntityManager<MongoDriver>): AreaController {
        if (!AreaController.instance) {
            console.log("me estan llamando");
            console.log(AreaController.instance);
            AreaController.instance = new AreaController(em);
            console.log(AreaController.instance);
        }
        return AreaController.instance;
    }

    findAll = async (): Promise<ExpressResponse_Migration<Area[]>> => {
        try {
            const areas: Area[] = await this.em.findAll(Area, {
                populate: ["*"],
            });

            await this.em.flush();

            let areasSinBorradoLogico = areas.filter((a) => a.borradoLogico == false);

            return {
                message: "Areas found successfully",
                success: true,
                data: areasSinBorradoLogico,
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

    findAllConBorrado = async (limit: number, offset: number): Promise<ExpressResponse_Migration<Area[]>> => {
        try {
            const [areas, total] = await this.em.findAndCount(
                Area,
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
                message: "Areas found successfully",
                success: true,
                data: areas,
                totalPages: totalPages,
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

    findOne = async (id: string): Promise<ExpressResponse_Migration<Area>> => {
        try {
            const response = await this.findOneArea(id);
            if (!response.success)
                return {
                    message: "Area not found",
                    // error: "Area not found",
                    data: null,
                    totalPages: undefined,
                    success: false,
                };

            const area = response.data!;

            return {
                message: "Area found successfully",
                success: true,
                data: area,
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

    add = async (newArea: Area): Promise<ExpressResponse_Migration<Area>> => {
        try {
            let areasMatch: Area[] = await this.em.findAll(Area, { where: { nombre: newArea.nombre } });

            if (areasMatch.length != 0) {
                throw new Error("Ya hay un area con ese nombre");
            }

            await this.em.persist(newArea).flush();

            return {
                message: "Area created",
                data: newArea,
                totalPages: undefined,
                success: true,
            };
        } catch (error) {
            return {
                message: "Error adding the new area",
                data: null,
                success: false,
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                totalPages: undefined,
            };
        }
    };

    modify = async (newArea: Partial<Area>, areaId: string): Promise<ExpressResponse_Migration<Area>> => {
        try {
            const areaAModificar = this.em.getReference(Area, areaId);

            if (!areaAModificar)
                return {
                    message: "Area no encontrada",
                    data: null,
                    success: false,
                    // error: "Area no encontrada",
                    totalPages: undefined,
                };

            if (newArea.nombre) areaAModificar.nombre = newArea.nombre;

            await this.em.flush();

            return {
                message: "Area modified successfully",
                data: areaAModificar,
                totalPages: undefined,
                success: true,
            };
        } catch (error) {
            return {
                message: "Error modifying the area",
                data: null,
                success: false,
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                totalPages: undefined,
            };
        }
    };

    delete_ = async (id: string): Promise<ExpressResponse_Migration<null>> => {
        try {
            const response = await this.findOneArea(id);
            if (!response.success)
                return {
                    message: "Area not found",
                    data: null,
                    totalPages: undefined,
                    success: false,
                };

            const areaABorrar = response.data!;

            areaABorrar.borradoLogico = true;

            let cantMaterias = await areaABorrar.materias.load();

            const materiaController = new MateriaController(this.em);
            // for (let index = 0; index < cantMaterias.count(); index++) {
            //     areaABorrar.materias[index].borradoLogico = true;
            // }
            // await Promise.all(cantMaterias.map((materia) => this.materiaController.delete_(materia._id)));

            await this.em.flush();

            return {
                message: "Area deleted successfully",
                data: null,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "Error deleting the area",
                data: null,
                success: false,
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                totalPages: undefined,
            };
        }
    };

    findOneArea = async (id: string): Promise<ExpressResponse_Migration<Area>> => {
        try {
            const area: Area | null = await this.em.findOne(Area, id, {
                populate: ["*"],
            });

            await this.em.flush();
            if (!area) return { message: "Area not found", data: null, success: false, totalPages: undefined };

            return {
                message: "Area found successfully",
                data: area,
                success: true,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "Error finding the area",
                data: null,
                success: false,
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                totalPages: undefined,
            };
        }
    };
}
