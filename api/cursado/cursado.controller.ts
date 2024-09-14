import { NextFunction, Request, Response } from "express";
import { Cursado } from "./cursado.entity.js";
import { ExpressResponse, TipoCursado } from "../shared/types.js";
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

        let cursadosSinBorradoLogico = cursados.filter((c) => c.borradoLogico == false);

        const response: ExpressResponse<Cursado[]> = { message: "Cursados Encontrados", data: cursadosSinBorradoLogico };
        res.json(response);
    } catch (error) {
        const response: ExpressResponse<Cursado[]> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function findAllConBorrado(req: Request, res: Response) {
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
    const tipoCursado = req.body.tipoCursado as TipoCursado;
    const materiaId = req.body.materiaId as string;
    const profesorId = req.body.profesorId as string;

    try {
        const materia: Materia | null = await findOneMateria(materiaId);

        const profesor: Profesor | null = await findOneProfesor(profesorId);

        if (tipoCursado != TipoCursado.Practica && tipoCursado != TipoCursado.Teoria) {
            const response: ExpressResponse<Cursado> = {
                message: `Tipo cursado no valido elegir ${TipoCursado.Practica} o ${TipoCursado.Teoria}`,
                data: undefined,
            };
            return res.status(404).send(response);
        }

        if (!materia || materia.borradoLogico == true) {
            const response: ExpressResponse<Cursado> = { message: "Materia no Válida", data: undefined };
            return res.status(404).send(response);
        }
        if (!profesor || profesor.borradoLogico == true) {
            const response: ExpressResponse<Cursado> = { message: "Profesor no Válido", data: undefined };
            return res.status(404).send(response);
        }

        const matches = await buscarCursadosPorAtributos(comision, año, materia._id);

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

        if (cursadoSuperpuesto) {
            const response: ExpressResponse<Cursado> = { message: "Este profesor ya tiene un cursado en ese dia y horario", data: undefined };
            return res.status(404).send(response);
        }

        const nuevoCursado = new Cursado(diaCursado, horaInicio, horaFin, comision, turno, año, materia, profesor, tipoCursado);

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
    const tipoCursado = req.body.tipoCursado as TipoCursado | undefined;

    try {
        if (tipoCursado != TipoCursado.Practica && tipoCursado != TipoCursado.Teoria) {
            const response: ExpressResponse<Cursado> = {
                message: `Tipo cursado no valido elegir ${TipoCursado.Practica} o ${TipoCursado.Teoria}`,
                data: undefined,
            };
            return res.status(404).send(response);
        }

        const cursadoAModificar: Cursado | undefined = orm.em.getReference(Cursado, _id);

        if (cursadoAModificar) {
            if (diaCursado) cursadoAModificar.diaCursado = diaCursado;
            if (horaInicio) cursadoAModificar.horaInicio = horaInicio;
            if (horaFin) cursadoAModificar.horaFin = horaFin;
            if (comision) cursadoAModificar.comision = comision;
            if (turno) cursadoAModificar.turno = turno;
            if (año) cursadoAModificar.año = año;
            if (tipoCursado) cursadoAModificar.tipoCursado = tipoCursado;
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
        const cursadoABorrar: Cursado | null = await findOneCursado(_id);

        if (!cursadoABorrar) {
            const response: ExpressResponse<Cursado> = { message: "Cursado no encontrado", data: undefined };
            return res.status(404).send(response);
        }

        cursadoABorrar.borradoLogico = true;

        let cantReviews = await cursadoABorrar.reviews.load();

        for (let index = 0; index < cantReviews.count(); index++) {
            cursadoABorrar.reviews[index].borradoLogico = true;
        }

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

async function buscarCursadosPorAtributos(comision: number, año: number, materiaId: string): Promise<Cursado[]> {
    try {
        const materia: Materia | null = await findOneMateria(materiaId);

        if (!materia) {
            throw new Error("Materia borrada");
        }

        const cursados: Cursado[] = await orm.em.findAll(Cursado, { where: { comision, año, materia }, populate: ["*"] });

        await orm.em.flush();
        return cursados;
    } catch (error) {
        console.error(new Error("Error al buscar el cursado"));
        return [];
    }
}

export { findAll, findOne, add, modify, delete_, findOneCursado, findAllConBorrado, buscarCursadosPorAtributos };
