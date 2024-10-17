import { Request, Response } from "express";
import { Cursado } from "../cursado/cursado.entity.js";
import { dateFromString } from "../dateExtension.js";
import { helpers as materiaHelper } from "../materia/materia.controller.js";
import { Materia } from "../materia/materia.entity.js";
import { orm } from "../orm.js";
import { Review } from "../review/review.entity.js";
import { ExpressResponse, Sexo } from "../shared/types.js";
import { Profesor } from "./profesor.entity.js";
import { z } from "zod";

const profesorSchema = z.object({
    nombre: z.string().regex(/^[a-zA-Z]+$/, "El nombre es requerido"),
    apellido: z.string().regex(/^[a-zA-Z]+$/, "El apellido es requerido"),
    fechaNacimiento: z.string().min(10, "La fecha de nacimiento debe seguir el formato aaaa/mm/dd"),
    dni: z.number().refine((value) => value >= 10000000 && value <= 99999999, {
        message: "El DNI debe tener exactamente 8 dígitos",
    }),
    sexo: z
        .string()
        .transform((value) => value.toLowerCase())
        .refine((value) => ["mujer", "hombre"].includes(value), {
            message: "El sexo debe ser 'Mujer' o 'Hombre'",
        })
        .transform((value) => {
            return value === "mujer" ? Sexo.Mujer : Sexo.Hombre;
        }),
});

async function findAll(req: Request, res: Response) {
    try {
        const profesores: Profesor[] | undefined = await orm.em.findAll(Profesor, {
            populate: ["*"],
        });

        await orm.em.flush();

        let profesoresSinBorradoLogico = profesores.filter((p) => p.borradoLogico == false);

        const reponse: ExpressResponse<Profesor[]> = {
            message: "Profesores encontrados:",
            data: profesoresSinBorradoLogico,
            totalPages: undefined,
        };
        res.json(reponse);
    } catch (error) {
        const response: ExpressResponse<Profesor> = {
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

        const [profesores, total] = await orm.em.findAndCount(
            Profesor,
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

        const response: ExpressResponse<Profesor[]> = {
            message: "Profesores encontrados:",
            data: profesores,
            totalPages: totalPages,
        };
        res.json(response);
    } catch (error) {
        const response: ExpressResponse<Profesor> = {
            message: String(error),
            data: undefined,
            totalPages: undefined,
        };
        res.status(500).send(response);
    }
}

async function findOne(req: Request, res: Response) {
    const _id = req.params.id;

    try {
        const profesor = await helpers.findOneProfesor(_id);

        if (!profesor) {
            const response: ExpressResponse<Profesor> = {
                message: "Profesor no encontrado",
                data: undefined,
                totalPages: undefined,
            };
            return res.status(404).send(response);
        }
        res.json({ data: profesor });
    } catch (error) {
        const response: ExpressResponse<Profesor> = {
            message: String(error),
            data: undefined,
            totalPages: undefined,
        };
        res.status(500).send(response);
    }
}

async function add(req: Request, res: Response) {
    const profesorValidation = profesorSchema.safeParse(req.body);

    if (!profesorValidation.success) {
        return res.status(400).send({
            message: "Error de validación",
            errors: profesorValidation.error.errors,
        });
    }

    const { nombre, apellido, fechaNacimiento, dni, sexo } = profesorValidation.data;

    const nuevoProfesor = new Profesor(nombre, apellido, dateFromString(fechaNacimiento), dni, 0, sexo);

    try {
        await orm.em.persist(nuevoProfesor).flush();
        const response: ExpressResponse<Profesor> = {
            message: "Profesor creado",
            data: nuevoProfesor,
            totalPages: undefined,
        };
        res.status(201).send(response);
    } catch (error) {
        const response: ExpressResponse<Profesor> = {
            message: String(error),
            data: undefined,
            totalPages: undefined,
        };
        res.status(500).send(response);
    }
}

async function modify(req: Request, res: Response) {
    const _id = req.params.id as string;

    const profesorValidation = profesorSchema.safeParse(req.body);

    if (!profesorValidation.success) {
        return res.status(400).send({
            message: "Error de validación",
            errors: profesorValidation.error.errors,
        });
    }

    const { nombre, apellido, fechaNacimiento, dni, sexo } = profesorValidation.data;

    try {
        const profesorAModificar = orm.em.getReference(Profesor, _id);

        if (!profesorAModificar) {
            const response: ExpressResponse<Profesor> = {
                message: "Profesor  no encontrado",
                data: undefined,
                totalPages: undefined,
            };
            return res.status(404).send(response);
        }

        if (fechaNacimiento) profesorAModificar.fechaNacimiento = dateFromString(fechaNacimiento);
        if (nombre) profesorAModificar.nombre = nombre;
        if (apellido) profesorAModificar.apellido = apellido;
        if (dni) profesorAModificar.dni = dni;
        if (sexo) {
            profesorAModificar.sexo = sexo;
        }

        await orm.em.flush();
        res.status(200).send({ message: "Profesor modificado", data: profesorAModificar });
    } catch (error) {
        const response: ExpressResponse<Profesor> = {
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
        const profesorABorrar: Profesor | null = await helpers.findOneProfesor(_id);

        if (!profesorABorrar) {
            const response: ExpressResponse<Profesor> = {
                message: "Profesor no encontrado",
                data: undefined,
                totalPages: undefined,
            };
            return res.status(404).send(response);
        }

        profesorABorrar.borradoLogico = true;

        let cantCursados = await profesorABorrar.cursados.load();

        for (let index = 0; index < cantCursados.count(); index++) {
            profesorABorrar.cursados[index].borradoLogico = true;
        }

        await orm.em.flush();

        const response: ExpressResponse<Profesor> = {
            message: "Profesor borrado",
            data: profesorABorrar,
            totalPages: undefined,
        };
        res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Profesor> = {
            message: String(error),
            data: undefined,
            totalPages: undefined,
        };
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

        const reviews: Review[] = await orm.em.find(Review, {
            cursado: { $in: cursados.map((cursado) => cursado) },
        });

        await orm.em.flush();

        const response: ExpressResponse<Review[]> = {
            message: "Reviews Encontradas",
            data: reviews,
            totalPages: undefined,
        };
        return res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Profesor> = {
            message: String(error),
            data: undefined,
            totalPages: undefined,
        };
        return res.status(500).send(response);
    }
}

async function findPorMateriaYAno(req: Request, res: Response) {
    try {
        const _idMateria = req.params.idMateria as string;
        const _Ano = parseInt(req.params.ano) as number;

        const materia: Materia | null = await materiaHelper.findOneMateria(_idMateria);

        if (!materia || materia.borradoLogico == true) {
            throw new Error("Materia borrado");
        }

        const cursados: Cursado[] = await orm.em.findAll(Cursado, {
            populate: ["*"],
            //@ts-ignore
            where: {
                borradoLogico: false,
                materia: { _id: _idMateria },
                //@ts-ignore
                comision: { $re: new RegExp(`^${_Ano}`) },
            },
        });

        const idsProf = cursados.map((c) => c.profesor._id);

        const resultado: Profesor[] = await orm.em.findAll(Profesor, {
            populate: ["*"],
            where: {
                _id: { $in: idsProf },
                borradoLogico: false,
            },
        });

        await orm.em.flush();

        const response: ExpressResponse<Profesor[]> = {
            message: "Profesores Encontradas",
            data: resultado,
            totalPages: undefined,
        };
        return res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Profesor> = {
            message: String(error),
            data: undefined,
            totalPages: undefined,
        };
        return res.status(500).send(response);
    }
}

async function findReviewsPorMateria(req: Request, res: Response) {
    try {
        const _id = req.params.id as string;
        const _idMateria = req.params.idMateria as string;

        const profesor: Profesor | null = await helpers.findOneProfesor(_id);

        if (!profesor) {
            throw new Error("Profesor borrado");
        }

        const cursados = profesor.cursados.filter((c) => c.materia._id == _idMateria).map((c) => c._id);

        const reviews: Review[] = await orm.em.find(Review, {
            cursado: { $in: cursados.map((cursado) => cursado) },
        });

        await orm.em.flush();

        const response: ExpressResponse<Review[]> = {
            message: "Reviews Encontradas",
            data: reviews,
            totalPages: undefined,
        };
        return res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Profesor> = {
            message: String(error),
            data: undefined,
            totalPages: undefined,
        };
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

export { add, delete_, findAll, findAllConBorrado, findOne, findPorMateriaYAno, findReviews, findReviewsPorMateria, helpers, modify };
