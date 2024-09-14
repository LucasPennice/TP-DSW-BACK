import { NextFunction, Request, Response } from "express";
import { Materia } from "./materia.entity.js";
import { ExpressResponse } from "../shared/types.js";
import { Area } from "../area/area.entity.js";
import { orm } from "../orm.js";
import { findOneArea } from "../area/area.controller.js";

async function findAll(req: Request, res: Response) {
    try {
        const materias = await orm.em.findAll(Materia, {
            populate: ["*"],
        });

        await orm.em.flush();

        const response: ExpressResponse<Materia[]> = { message: "Materias Encontradas", data: materias };
        res.json(response);
    } catch (error) {
        const response: ExpressResponse<Materia[]> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function findOne(req: Request, res: Response) {
    const _id = req.params.id;

    try {
        const materia = await findOneMateria(_id);

        if (!materia) {
            const response: ExpressResponse<Materia[]> = { message: "Materia no Encontrada", data: undefined };
            return res.status(404).send(response);
        }
        const response: ExpressResponse<Materia> = { message: "Materia Encontrada", data: materia };
        res.json(response);
    } catch (error) {
        const response: ExpressResponse<Materia> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function add(req: Request, res: Response) {
    const nombre = req.body.nombre as string;
    const areaId = req.body.areaId as string;

    const area: Area | null = await findOneArea(areaId);

    // 🚨 VALIDAR CON ZOD 🚨
    if (!area) {
        const response: ExpressResponse<Area> = { message: "Area no Válida", data: undefined };
        return res.status(404).send(response);
    }

    const nuevaMateria = new Materia(nombre, area);
    try {
        await orm.em.persist(nuevaMateria).flush();

        const response: ExpressResponse<Materia> = { message: "Materia Creada", data: nuevaMateria };
        res.status(201).send(response);
    } catch (error) {
        const response: ExpressResponse<Materia> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function modify(req: Request, res: Response) {
    const _id = req.params.id as string;

    const nombre = req.body.nombre as string | undefined;

    try {
        const materiaAModificar: Materia | undefined = orm.em.getReference(Materia, _id);

        if (!materiaAModificar) {
            const response: ExpressResponse<Materia> = { message: String("Materia no encontrada"), data: undefined };
            return res.status(404).send(response);
        }

        if (nombre) materiaAModificar.nombre = nombre;

        await orm.em.flush();

        const response: ExpressResponse<Materia> = { message: String("Materia modificada"), data: materiaAModificar };
        res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Materia> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function delete_(req: Request, res: Response) {
    const _id = req.params.id as string;

    try {
        const materiaABorrar: Materia | undefined = orm.em.getReference(Materia, _id);

        if (!materiaABorrar) {
            const response: ExpressResponse<Materia> = { message: "Materia no encontrada", data: undefined };
            return res.status(404).send(response);
        }

        materiaABorrar.borradoLogico = true;
        await orm.em.flush();

        const response: ExpressResponse<Materia> = { message: String("Materia Borrada"), data: materiaABorrar };
        res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Materia> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

// CAMBIAR ESTA TMBN

async function findOneMateria(_id: string): Promise<Materia | null> {
    try {
        const materia: Materia | null = await orm.em.findOne(Materia, _id, {
            populate: ["*"],
        });

        await orm.em.flush();
        return materia;
    } catch (error) {
        console.error(new Error("Error al buscar la materia"));
        return null;
    }
}

export { findAll, findOne, add, modify, delete_, findOneMateria };
