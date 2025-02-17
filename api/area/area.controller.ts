import { Request, Response } from "express";
import { Area } from "./area.entity.js";
import { ExpressResponse } from "../shared/types.js";
import { z } from "zod";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";

const areaSchema = z.object({
    nombre: z.string().min(1, "El nombre es requerido"),
});

export class AreaController {
    private em: MongoEntityManager<MongoDriver>;

    async findAll(req: Request, res: Response) {
        try {
            const areas: Area[] = await this.em.findAll(Area, {
                populate: ["*"],
            });

            await this.em.flush();

            let areasSinBorradoLogico = areas.filter((a) => a.borradoLogico == false);

            const reponse: ExpressResponse<Area[]> = {
                message: "Areas encontradas:",
                data: areasSinBorradoLogico,
                totalPages: undefined,
            };
            res.json(reponse);
        } catch (error) {
            const reponse: ExpressResponse<Area> = {
                message: String(error),
                data: undefined,
                totalPages: undefined,
            };
            res.status(500).send(reponse);
        }
    }

    async findAllConBorrado(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const [areas, total] = await this.em.findAndCount(
                Area,
                {},
                {
                    populate: ["*"],
                    limit,
                    offset,
                }
            );
            // const cursados: Cursado[] | undefined = await this.em.findAll(Cursado, {
            //     populate: ["*"],
            // });

            await this.em.flush();

            const totalPages = Math.ceil(total / limit);

            const reponse: ExpressResponse<Area[]> = {
                message: "Areas encontradas:",
                data: areas,
                totalPages: totalPages,
            };
            res.json(reponse);
        } catch (error) {
            const reponse: ExpressResponse<Area> = {
                message: String(error),
                data: undefined,
                totalPages: undefined,
            };
            res.status(500).send(reponse);
        }
    }

    async findOne(req: Request, res: Response) {
        const _id = req.params.id;

        try {
            const area = await this.findOneArea(_id);
            if (!area) {
                const reponse: ExpressResponse<Area> = {
                    message: "Area no encontrada",
                    data: undefined,
                    totalPages: undefined,
                };
                return res.status(404).send(reponse);
            }
            res.json({ data: area });
        } catch (error) {
            const reponse: ExpressResponse<Area> = {
                message: String(error),
                data: undefined,
                totalPages: undefined,
            };
            res.status(500).send(reponse);
        }
    }

    async add(req: Request, res: Response) {
        const areaValidation = areaSchema.safeParse(req.body);

        if (!areaValidation.success) {
            return res.status(400).send({
                message: "Error de validación",
                errors: areaValidation.error.errors,
            });
        }

        const { nombre } = areaValidation.data;

        const nuevoArea = new Area(nombre);
        try {
            let areasMatch: Area[] = await this.em.findAll(Area, { where: { nombre } });
            if (areasMatch.length != 0) {
                throw new Error("Ya hay un area con ese nombre");
            }

            await this.em.persist(nuevoArea).flush();

            const reponse: ExpressResponse<Area> = {
                message: "Area creada",
                data: nuevoArea,
                totalPages: undefined,
            };

            res.status(201).send(reponse);
        } catch (error) {
            const reponse: ExpressResponse<Area> = {
                message: String(error),
                data: undefined,
                totalPages: undefined,
            };

            res.status(500).send(reponse);
        }
    }

    async modify(req: Request, res: Response) {
        const _id = req.params.id as string;

        const areaValidation = areaSchema.partial().safeParse(req.body);

        if (!areaValidation.success) {
            return res.status(400).send({
                message: "Error de validación",
                errors: areaValidation.error.errors,
            });
        }

        const { nombre } = areaValidation.data;

        try {
            const areaAModificar = this.em.getReference(Area, _id);

            if (!areaAModificar) {
                const response: ExpressResponse<Area> = {
                    message: "Area no encontrada",
                    data: undefined,
                    totalPages: undefined,
                };

                return res.status(404).send(response);
            }

            if (nombre) areaAModificar.nombre = nombre;
            await this.em.flush();

            const response: ExpressResponse<Area> = {
                message: "Area modificada",
                data: areaAModificar,
                totalPages: undefined,
            };
            res.status(200).send(response);
        } catch (error) {
            const response: ExpressResponse<Area> = {
                message: String(error),
                data: undefined,
                totalPages: undefined,
            };
            res.status(500).send(response);
        }
    }

    async delete_(req: Request, res: Response) {
        const _id = req.params.id as string;

        try {
            const areaABorrar: Area | null = await this.findOneArea(_id);

            if (!areaABorrar) {
                const response: ExpressResponse<Area> = {
                    message: "Area no encontrada",
                    data: undefined,
                    totalPages: undefined,
                };
                return res.status(404).send(response);
            }

            areaABorrar.borradoLogico = true;

            let cantMaterias = await areaABorrar.materias.load();

            for (let index = 0; index < cantMaterias.count(); index++) {
                areaABorrar.materias[index].borradoLogico = true;
            }

            await this.em.flush();

            const response: ExpressResponse<Area> = {
                message: "Area borrada",
                data: areaABorrar,
                totalPages: undefined,
            };
            res.status(200).send(response);
        } catch (error) {
            const response: ExpressResponse<Area> = {
                message: String(error),
                data: undefined,
                totalPages: undefined,
            };
            res.status(500).send(response);
        }
    }
    async findOneArea(_id: string): Promise<Area | null> {
        try {
            const area: Area | null = await this.em.findOne(Area, _id, {
                populate: ["*"],
            });

            await this.em.flush();
            return area;
        } catch (error) {
            console.error(new Error("Error al buscar el area"));
            return null;
        }
    }
    constructor(em: MongoEntityManager<MongoDriver>) {
        this.em = em;
    }
}
