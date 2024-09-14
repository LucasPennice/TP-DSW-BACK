import { NextFunction, Request, Response } from "express";
import { Cursado } from "./cursado.entity.js";
import { ExpressResponse } from "../shared/types.js";
import { Materia } from "../materia/materia.entity.js";
import { findOneMateria } from "../materia/materia.controller.js";
import { Profesor } from "../profesor/profesor.entity.js";
import { orm } from "../orm.js";
import { findOneProfesor } from "../profesor/profesor.controller.js";

async function findAll(req: Request, res: Response) {
    try {
        const cursados: Cursado[] | undefined = await orm.em.findAll(Cursado, {
            populate: ["*"],
        });

        await orm.em.flush();

        const response: ExpressResponse<Cursado[]> = { message: "Cursados Encontrados", data: cursados };
        res.json(response);
    } catch (error) {
        const response: ExpressResponse<Cursado[]> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function findOne(req: Request, res: Response) {
    const _id = req.params.id;

    try {
        const cursado: Cursado | null = await orm.em.findOne(Cursado, _id, {
            populate: ["*"],
        });

        await orm.em.flush();

        if (!cursado) {
            const response: ExpressResponse<Cursado> = { message: "Cursado no Encontrada", data: undefined };
            return res.status(404).send(response);
        }
        const response: ExpressResponse<Cursado> = { message: "Cursado Encontrado", data: cursado };
        res.json(response);
    } catch (error) {
        const response: ExpressResponse<Cursado> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function add(req: Request, res: Response) {
    const diaCursado = req.body.diaCursado as string;
    const horaInicio = req.body.horaInicio as string;
    const horaFin = req.body.horaFin as string;
    const comision = req.body.comision as number;
    const turno = req.body.turno as string;
    const año = req.body.año as number;
    const materiaId = req.body.materiaId as string;
    const profesorId = req.body.profesorId as string;

    const materia: Materia | null = await findOneMateria(materiaId);

    const profesor: Profesor | null = await findOneProfesor(profesorId);

    if (!materia) {
        const response: ExpressResponse<Cursado> = { message: "Materia no Válida", data: undefined };
        return res.status(404).send(response);
    }
    if (!profesor) {
        const response: ExpressResponse<Cursado> = { message: "Profesor no Válido", data: undefined };
        return res.status(404).send(response);
    }

    const nuevoCursado = new Cursado(diaCursado, horaInicio, horaFin, comision, turno, año, materia, profesor);

    try {
        await orm.em.persist(nuevoCursado).flush();

        const response: ExpressResponse<Cursado> = { message: "Cursado Creada", data: nuevoCursado };
        res.status(201).send(response);
    } catch (error) {
        const response: ExpressResponse<Cursado> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function modify(req: Request, res: Response) {
    const _id = req.params.id as string;

    const diaCursado = req.body.diaCursado as string | undefined;
    const horaInicio = req.body.horaInicio as string | undefined;
    const horaFin = req.body.horaFin as string | undefined;
    const comision = req.body.comision as number | undefined;
    const turno = req.body.turno as string | undefined;
    const año = req.body.año as number | undefined;

    try {
        const cursadoAModificar: Cursado | undefined = orm.em.getReference(Cursado, _id);

        if (cursadoAModificar) {
            if (diaCursado) cursadoAModificar.diaCursado = diaCursado;
            if (horaInicio) cursadoAModificar.horaInicio = horaInicio;
            if (horaFin) cursadoAModificar.horaFin = horaFin;
            if (comision) cursadoAModificar.comision = comision;
            if (turno) cursadoAModificar.turno = turno;
            if (año) cursadoAModificar.año = año;
        }

        await orm.em.flush();

        if (!cursadoAModificar) {
            const response: ExpressResponse<Cursado> = { message: String("Cursado no encontrada"), data: undefined };
            return res.status(404).send(response);
        }

        const response: ExpressResponse<Cursado> = { message: String("Cursado modificada"), data: cursadoAModificar };
        res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Cursado> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function delete_(req: Request, res: Response) {
    const _id = req.params.id as string;

    try {
        const cursadoABorrar = orm.em.getReference(Cursado, _id);

        if (!cursadoABorrar) {
            const response: ExpressResponse<Cursado> = { message: "Cursado no encontrado", data: undefined };
            return res.status(404).send(response);
        }

        cursadoABorrar.borradoLogico = true;
        await orm.em.flush();

        const response: ExpressResponse<Cursado> = { message: String("Cursado Borrado"), data: cursadoABorrar };
        res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Cursado> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function findOneCursado(_id: string): Promise<Cursado | null> {
    try {
        const cursado: Cursado | null = await orm.em.findOne(Cursado, _id, {
            populate: ["*"],
        });

        await orm.em.flush();
        return cursado;
    } catch (error) {
        console.error(new Error("Error al buscar el cursado"));
        return null;
    }
}

export { findAll, findOne, add, modify, delete_, findOneCursado };

// agregar para buscar por comision + año + materia
