import { NextFunction, Request, Response } from "express";
import { Materia } from "./materia.entity.js";
import { ExpressResponse, TipoCursado } from "../shared/types.js";
import { Area } from "../area/area.entity.js";
import { orm } from "../orm.js";
import { findOneArea } from "../area/area.controller.js";

async function findAll(req: Request, res: Response) {
    try {
        const materias = await orm.em.findAll(Materia, {
            populate: ["*"],
        });

        await orm.em.flush();

        let materiasSinBorradoLogico = materias.filter((m) => m.borradoLogico == false);

        const response: ExpressResponse<Materia[]> = { message: "Materias Encontradas", data: materiasSinBorradoLogico };
        res.json(response);
    } catch (error) {
        const response: ExpressResponse<Materia[]> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function findAllConBorrado(req: Request, res: Response) {
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
        const materia = await helpers.findOneMateria(_id);

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
    if (!area || area.borradoLogico == true) {
        const response: ExpressResponse<Area> = { message: "Area no Válida", data: undefined };
        return res.status(404).send(response);
    }

    const nuevaMateria = new Materia(nombre, area);

    try {
        let materiasMatch: Materia[] = await orm.em.findAll(Materia, { where: { nombre } });
        if (materiasMatch.length != 0) {
            throw new Error("Ya hay una materia con ese nombre");
        }

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
        const materiaABorrar: Materia | null = await helpers.findOneMateria(_id);

        if (!materiaABorrar) {
            const response: ExpressResponse<Materia> = { message: "Materia no encontrada", data: undefined };
            return res.status(404).send(response);
        }

        materiaABorrar.borradoLogico = true;

        let cantCursados = await materiaABorrar.cursados.load();

        for (let index = 0; index < cantCursados.count(); index++) {
            materiaABorrar.cursados[index].borradoLogico = true;
        }

        await orm.em.flush();

        const response: ExpressResponse<Materia> = { message: String("Materia Borrada"), data: materiaABorrar };
        res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Materia> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function findMateriasPorAno(req: Request, res: Response) {
    try {
        const _idAno = parseInt(req.params.id);

        const materias: Materia[] = await orm.em.findAll(Materia, {
            populate: ["*"],
        });

        let resultado = materias.filter((m) => m.cursados.toArray().filter((x) => x.comision.toString()[0] == _idAno.toString()).length != 0);

        await orm.em.flush();

        const response: ExpressResponse<Materia[]> = { message: "Materias Encontradas", data: resultado };
        return res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Materia> = { message: String(error), data: undefined };
        return res.status(500).send(response);
    }
}

const helpers = {
    findOneMateria: async function (_id: string): Promise<Materia | null> {
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
    },
};

export { findAll, findOne, add, modify, delete_, helpers, findAllConBorrado, findMateriasPorAno };
