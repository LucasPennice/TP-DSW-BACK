import { Request, Response } from "express";
import { dateFromString } from "../dateExtension.js";
import { Sexo } from "../shared/types.js";
import { Profesor } from "./profesor.entity.js";
import { ExpressResponse } from "../shared/types.js";
import { orm } from "../orm.js";
import { Review } from "../review/review.entity.js";

async function findAll(req: Request, res: Response) {
    try {
        const profesores: Profesor[] | undefined = await orm.em.findAll(Profesor, {
            populate: ["*"],
        });

        await orm.em.flush();

        let profesoresSinBorradoLogico = profesores.filter((p) => p.borradoLogico == false);

        const reponse: ExpressResponse<Profesor[]> = { message: "Profesores encontrados:", data: profesoresSinBorradoLogico };
        res.json(reponse);
    } catch (error) {
        const response: ExpressResponse<Profesor> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function findAllConBorrado(req: Request, res: Response) {
    try {
        const profesores: Profesor[] | undefined = await orm.em.findAll(Profesor, {
            populate: ["*"],
        });

        await orm.em.flush();

        const reponse: ExpressResponse<Profesor[]> = { message: "Profesores encontrados:", data: profesores };
        res.json(reponse);
    } catch (error) {
        const response: ExpressResponse<Profesor> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function findOne(req: Request, res: Response) {
    const _id = req.params.id;

    try {
        const profesor = await helpers.findOneProfesor(_id);

        if (!profesor) {
            const response: ExpressResponse<Profesor> = { message: "Profesor no encontrado", data: undefined };
            return res.status(404).send(response);
        }
        res.json({ data: profesor });
    } catch (error) {
        const response: ExpressResponse<Profesor> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function add(req: Request, res: Response) {
    const nombre = req.body.nombre as string;
    const apellido = req.body.apellido as string;
    const fechaNacimiento = req.body.fechaNacimiento as string; // DD/MM/AAAA
    const dni = req.body.dni as number;
    const puntuacionGeneral = req.body.puntuacionGeneral as number | undefined;
    const sexoTentativo = req.body.sexo as string;
    const sexo: Sexo = sexoTentativo == Sexo.Hombre ? Sexo.Hombre : Sexo.Mujer;

    // 🚨 VALIDAR CON ZOD 🚨

    const nuevoProfesor = new Profesor(nombre, apellido, dateFromString(fechaNacimiento), dni, puntuacionGeneral ?? 0, sexo);

    try {
        await orm.em.persist(nuevoProfesor).flush();
        const response: ExpressResponse<Profesor> = { message: "Profesor creado", data: nuevoProfesor };
        res.status(201).send(response);
    } catch (error) {
        const response: ExpressResponse<Profesor> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function modify(req: Request, res: Response) {
    const _id = req.params.id as string;

    const nombre = req.body.nombre as string | undefined;
    const apellido = req.body.apellido as string | undefined;
    const fechaNacimiento = dateFromString(req.body.fechaNacimiento) as Date | undefined; // DD/MM/AAAA | undefined
    const dni = req.body.dni as number | undefined;
    const puntuacionGeneral = req.body.puntuacionGeneral as number | undefined;
    const sexoTentativo = req.body.sexo as string | undefined;

    try {
        const profesorAModificar = orm.em.getReference(Profesor, _id);

        if (!profesorAModificar) {
            const response: ExpressResponse<Profesor> = { message: "Profesor  no encontrado", data: undefined };
            return res.status(404).send(response);
        }

        if (fechaNacimiento) profesorAModificar.fechaNacimiento = fechaNacimiento;
        if (nombre) profesorAModificar.nombre = nombre;
        if (apellido) profesorAModificar.apellido = apellido;
        if (dni) profesorAModificar.dni = dni;
        if (puntuacionGeneral) profesorAModificar.puntuacionGeneral = puntuacionGeneral;
        if (sexoTentativo) {
            const sexo: Sexo = sexoTentativo == Sexo.Hombre ? Sexo.Hombre : Sexo.Mujer;
            profesorAModificar.sexo = sexo;
        }

        await orm.em.flush();
        res.status(200).send({ message: "Profesor modificado", data: profesorAModificar });
    } catch (error) {
        const response: ExpressResponse<Profesor> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function delete_(req: Request, res: Response) {
    const _id = req.params.id as string;

    try {
        const profesorABorrar: Profesor | null = await helpers.findOneProfesor(_id);

        if (!profesorABorrar) {
            const response: ExpressResponse<Profesor> = { message: "Profesor no encontrado", data: undefined };
            return res.status(404).send(response);
        }

        profesorABorrar.borradoLogico = true;

        let cantCursados = await profesorABorrar.cursados.load();

        for (let index = 0; index < cantCursados.count(); index++) {
            profesorABorrar.cursados[index].borradoLogico = true;
        }

        await orm.em.flush();

        const response: ExpressResponse<Profesor> = { message: "Profesor borrado", data: profesorABorrar };
        res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Profesor> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function findReviews(req: Request, res: Response) {
    try {
        const _id = req.params.id as string;

        const profesor: Profesor | null = await helpers.findOneProfesor(_id);

        if (!profesor) {
            throw new Error("Profesor borrado");
        }

        const cursados = profesor.cursados.map((c) => c._id);

        const reviews: Review[] = await orm.em.findAll(Review, {
            where: {
                cursado: {
                    _id: { $in: cursados },
                },
            },
        });

        await orm.em.flush();

        const response: ExpressResponse<Review[]> = { message: "Reviews Encontradas", data: reviews };
        return res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Profesor> = { message: String(error), data: undefined };
        return res.status(500).send(response);
    }
}

const helpers = {
    findOneProfesor: async function (_id: string): Promise<Profesor | null> {
        try {
            const profesor: Profesor | null = await orm.em.findOne(Profesor, _id, {
                populate: ["*"],
            });

            await orm.em.flush();
            return profesor;
        } catch (error) {
            console.error(new Error("Error al buscar al profesor"));
            return null;
        }
    },
};

export { add, delete_, findAll, findOne, modify, findAllConBorrado, findReviews, helpers };
