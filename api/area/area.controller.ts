import { Request, Response } from "express";
import { Area } from "./area.entity.js";
import { ExpressResponse } from "../shared/types.js";
import { z } from "zod";
import { initORM } from "../orm.js";

const orm = await initORM();

const areaSchema = z.object({
    nombre: z.string().min(1, "El nombre es requerido"),
});

async function findAll(req: Request, res: Response) {
    try {
        const areas: Area[] = await orm.em.findAll(Area, {
            populate: ["*"],
        });

        await orm.em.flush();

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

async function findAllConBorrado(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const [areas, total] = await orm.em.findAndCount(
            Area,
            {},
            {
                populate: ["*"],
                limit,
                offset,
            }
        );
        // const cursados: Cursado[] | undefined = await orm.em.findAll(Cursado, {
        //     populate: ["*"],
        // });

        await orm.em.flush();

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

async function findOne(req: Request, res: Response) {
    const _id = req.params.id;

    try {
        const area = await findOneArea(_id);
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

async function add(req: Request, res: Response) {
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
        let areasMatch: Area[] = await orm.em.findAll(Area, { where: { nombre } });
        if (areasMatch.length != 0) {
            throw new Error("Ya hay un area con ese nombre");
        }

        await orm.em.persist(nuevoArea).flush();

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

async function modify(req: Request, res: Response) {
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
        const areaAModificar = orm.em.getReference(Area, _id);

        if (!areaAModificar) {
            const response: ExpressResponse<Area> = {
                message: "Area no encontrada",
                data: undefined,
                totalPages: undefined,
            };

            return res.status(404).send(response);
        }

        if (nombre) areaAModificar.nombre = nombre;
        await orm.em.flush();

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

async function delete_(req: Request, res: Response) {
    const _id = req.params.id as string;

    try {
        const areaABorrar: Area | null = await findOneArea(_id);

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

        await orm.em.flush();

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

async function findOneArea(_id: string): Promise<Area | null> {
    try {
        const area: Area | null = await orm.em.findOne(Area, _id, {
            populate: ["*"],
        });

        await orm.em.flush();
        return area;
    } catch (error) {
        console.error(new Error("Error al buscar el area"));
        return null;
    }
}

export { add, delete_, findAll, findOne, modify, findOneArea, findAllConBorrado };
