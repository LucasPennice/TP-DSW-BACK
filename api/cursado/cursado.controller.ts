import { NextFunction, Request, Response } from "express";
import { Cursado } from "./cursado.entity.js";
import { ExpressResponse, TipoCursado } from "../shared/types.js";
import { Materia } from "../materia/materia.entity.js";
import { helpers as materiaHelpers } from "../materia/materia.controller.js";
import { Profesor } from "../profesor/profesor.entity.js";
import { orm } from "../orm.js";
import { helpers as profesorHelper } from "../profesor/profesor.controller.js";
import { z } from "zod";

const primeraLetraMayuscula = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const cursadoSchema = z.object({
    diaCursado: z
        .string()
        .refine((value) => ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado"].includes(value.toLowerCase()), {
            message: "El día debe ser uno de los días válidos.",
        })
        .transform((value) => primeraLetraMayuscula(value.toLowerCase())),
    horaInicio: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "La hora de inicio debe ser del tipo xx:xx"),
    horaFin: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "La hora de fin debe ser del tipo xx:xx"),
    comision: z.number().refine((value) => value >= 100 && value <= 999, {
        message: "La comisión debe tener exactamente 3 dígitos",
    }),
    turno: z
        .string()
        .refine((value) => ["mañana", "tarde", "noche"].includes(value.toLowerCase()), {
            message: "El turno debe ser mañana, tarde o noche.",
        })
        .transform((value) => primeraLetraMayuscula(value.toLowerCase())),
    año: z.number().refine((value) => value >= 2000 && value <= 9999, {
        message: "El año debe tener exactamente 4 dígitos",
    }),
    tipoCursado: z
        .string()
        .transform((value) => value.toLowerCase())
        .refine((value) => ["teoria", "practica"].includes(value), {
            message: "El tipo debe ser 'Teoria' o 'Practica'",
        })
        .transform((value) => {
            return value === "teoria" ? TipoCursado.Teoria : TipoCursado.Practica;
        }),
    materiaId: z.string().min(1, "Es necesario seleccionar una materia"),
    profesorId: z.string().min(1, "Es necesario seleccionar un profesor"),
});

async function findAll(req: Request, res: Response) {
    try {
        const cursados: Cursado[] | undefined = await orm.em.findAll(Cursado, {
            populate: ["*"],
        });

        await orm.em.flush();

        let cursadosSinBorradoLogico = cursados.filter((c) => c.borradoLogico == false);

        const response: ExpressResponse<Cursado[]> = {
            message: "Cursados Encontrados",
            data: cursadosSinBorradoLogico,
            totalPages: undefined,
        };
        res.json(response);
    } catch (error) {
        const response: ExpressResponse<Cursado[]> = {
            message: String(error),
            data: undefined,
            totalPages: undefined,
        };
        res.status(500).send(response);
    }
}

async function findAllConBorrado(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const [cursados, total] = await orm.em.findAndCount(
            Cursado,
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

        const response: ExpressResponse<Cursado[]> = { message: "Cursados Encontrados", data: cursados, totalPages: totalPages };
        res.json(response);
    } catch (error) {
        const response: ExpressResponse<Cursado[]> = { message: String(error), data: undefined, totalPages: undefined };
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
            const response: ExpressResponse<Cursado> = {
                message: "Cursado no Encontrada",
                data: undefined,
                totalPages: undefined,
            };
            return res.status(404).send(response);
        }
        const response: ExpressResponse<Cursado> = {
            message: "Cursado Encontrado",
            data: cursado,
            totalPages: undefined,
        };
        res.json(response);
    } catch (error) {
        const response: ExpressResponse<Cursado> = {
            message: String(error),
            data: undefined,
            totalPages: undefined,
        };
        res.status(500).send(response);
    }
}

async function add(req: Request, res: Response) {
    const cursadoValidation = cursadoSchema.safeParse(req.body);

    if (!cursadoValidation.success) {
        return res.status(400).send({
            message: "Error de validación",
            errors: cursadoValidation.error.errors,
        });
    }

    const { diaCursado, horaInicio, horaFin, comision, turno, año, tipoCursado, materiaId, profesorId } = cursadoValidation.data;

    try {
        const materia: Materia | null = await materiaHelpers.findOneMateria(materiaId);

        const profesor: Profesor | null = await profesorHelper.findOneProfesor(profesorId);

        if (!materia || materia.borradoLogico == true) {
            const response: ExpressResponse<Cursado> = {
                message: "Materia no Válida",
                data: undefined,
                totalPages: undefined,
            };
            return res.status(404).send(response);
        }
        if (!profesor || profesor.borradoLogico == true) {
            const response: ExpressResponse<Cursado> = {
                message: "Profesor no Válido",
                data: undefined,
                totalPages: undefined,
            };
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
            const response: ExpressResponse<Cursado> = {
                message: "Este profesor ya tiene un cursado en ese dia y horario",
                data: undefined,
                totalPages: undefined,
            };
            return res.status(404).send(response);
        }

        const nuevoCursado = new Cursado(diaCursado, horaInicio, horaFin, comision, turno, año, materia, profesor, tipoCursado);

        await orm.em.persist(nuevoCursado).flush();

        const response: ExpressResponse<Cursado> = {
            message: "Cursado Creada",
            data: nuevoCursado,
            totalPages: undefined,
            // @ts-ignore
            // errors: cursadoValidation.error.errors,
        };
        res.status(201).send(response);
    } catch (error) {
        const response: ExpressResponse<Cursado> = {
            message: String(error),
            data: undefined,
            totalPages: undefined,
        };
        res.status(500).send(response);
    }
}

async function modify(req: Request, res: Response) {
    const _id = req.params.id as string;

    const cursadoValidation = cursadoSchema.partial().safeParse(req.body);

    if (!cursadoValidation.success) {
        return res.status(400).send({
            message: "Error de validación",
            errors: cursadoValidation.error.errors,
        });
    }

    const { diaCursado, horaInicio, horaFin, comision, turno, año, tipoCursado } = cursadoValidation.data;

    try {
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
            const response: ExpressResponse<Cursado> = {
                message: String("Cursado no encontrada"),
                data: undefined,
                totalPages: undefined,
            };
            return res.status(404).send(response);
        }

        const response: ExpressResponse<Cursado> = {
            message: String("Cursado modificada"),
            data: cursadoAModificar,
            totalPages: undefined,
        };
        res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Cursado> = {
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
        const cursadoABorrar: Cursado | null = await findOneCursado(_id);

        if (!cursadoABorrar) {
            const response: ExpressResponse<Cursado> = {
                message: "Cursado no encontrado",
                data: undefined,
                totalPages: undefined,
            };
            return res.status(404).send(response);
        }

        cursadoABorrar.borradoLogico = true;

        let cantReviews = await cursadoABorrar.reviews.load();

        for (let index = 0; index < cantReviews.count(); index++) {
            cursadoABorrar.reviews[index].borradoLogico = true;
        }

        await orm.em.flush();

        const response: ExpressResponse<Cursado> = {
            message: String("Cursado Borrado"),
            data: cursadoABorrar,
            totalPages: undefined,
        };
        res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Cursado> = {
            message: String(error),
            data: undefined,
            totalPages: undefined,
        };
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
        const materia: Materia | null = await materiaHelpers.findOneMateria(materiaId);

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
