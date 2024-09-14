import { Request, Response } from "express";
import { Area } from "./area.entity.js";
import { ExpressResponse } from "../shared/types.js";
import { orm } from "../orm.js";

/*
function sanitizeCatedraInput(req: Request, res: Response, next: NextFunction){
    req.body.sanitizeCatedraInput = {
        "name": req.body.name
    }
    
    Object.keys(req.body.sanitizeCatedraInput).forEach(key =>{
        if(req.body.sanitizeCatedraInput[key] == undefined){
            delete req.body.sanitizeCatedraInput[key]
        }
    })
    next()
}
*/

async function findAll(req: Request, res: Response) {
    try {
        const areas: Area[] = await orm.em.findAll(Area, {
            populate: ["*"],
        });

        await orm.em.flush();

        let areasSinBorradoLogico = areas.filter((a) => a.borradoLogico == false);

        const reponse: ExpressResponse<Area[]> = { message: "Areas encontradas:", data: areasSinBorradoLogico };
        res.json(reponse);
    } catch (error) {
        const reponse: ExpressResponse<Area> = { message: String(error), data: undefined };
        res.status(500).send(reponse);
    }
}

async function findAllConBorrado(req: Request, res: Response) {
    try {
        const areas: Area[] = await orm.em.findAll(Area, {
            populate: ["*"],
        });

        await orm.em.flush();

        const reponse: ExpressResponse<Area[]> = { message: "Areas encontradas:", data: areas };
        res.json(reponse);
    } catch (error) {
        const reponse: ExpressResponse<Area> = { message: String(error), data: undefined };
        res.status(500).send(reponse);
    }
}

async function findOne(req: Request, res: Response) {
    const _id = req.params.id;

    try {
        const area = findOneArea(_id);
        if (!area) {
            const reponse: ExpressResponse<Area> = { message: "Area no encontrada", data: undefined };
            return res.status(404).send(reponse);
        }
        res.json({ data: area });
    } catch (error) {
        const reponse: ExpressResponse<Area> = { message: String(error), data: undefined };
        res.status(500).send(reponse);
    }
}

async function add(req: Request, res: Response) {
    const nombre = req.body.nombre as string;

    // 🚨 VALIDAR CON ZOD 🚨

    const nuevoArea = new Area(nombre);
    try {
        // esta bien asi?

        await orm.em.persist(nuevoArea).flush();

        const reponse: ExpressResponse<Area> = { message: "Area creada", data: nuevoArea };

        res.status(201).send(reponse);
    } catch (error) {
        const reponse: ExpressResponse<Area> = { message: String(error), data: undefined };

        res.status(500).send(reponse);
    }
}

async function modify(req: Request, res: Response) {
    const _id = req.params.id as string;

    const nombre = req.body.nombre as string | undefined;

    try {
        const areaAModificar = orm.em.getReference(Area, _id);

        if (!areaAModificar) {
            const response: ExpressResponse<Area> = { message: "Area no encontrada", data: undefined };

            return res.status(404).send(response);
        }

        if (nombre) areaAModificar.nombre = nombre;
        await orm.em.flush();

        const response: ExpressResponse<Area> = { message: "Area modificada", data: areaAModificar };
        res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Area> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function delete_(req: Request, res: Response) {
    const _id = req.params.id as string;

    try {
        const areaABorrar = orm.em.getReference(Area, _id);

        if (!areaABorrar) {
            const response: ExpressResponse<Area> = { message: "Area no encontrada", data: undefined };
            return res.status(404).send(response);
        }

        areaABorrar.borradoLogico = true;
        await orm.em.flush();

        const response: ExpressResponse<Area> = { message: "Area borrada", data: areaABorrar };
        res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Area> = { message: String(error), data: undefined };
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
