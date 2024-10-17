import { Request, Response } from "express";
import { Usuario } from "./usuario.entity.js";
import { Sexo, UserRole } from "../shared/types.js";
import { ExpressResponse } from "../shared/types.js";
import { orm } from "../orm.js";
import { dateFromString } from "../dateExtension.js";
import { z } from "zod";

const usuarioSchema = z.object({
    legajo: z.string().regex(/^\d{5}$/, "El legajo debe constar de 5 digitos"),
    nombre: z.string().regex(/^[a-zA-Z]+$/, "El nombre es requerido"),
    apellido: z.string().regex(/^[a-zA-Z]+$/, "El apellido es requerido"),
    username: z.string().min(1, "El username es requerido"),
    fechaNacimiento: z.string().min(10, "La fecha de nacimiento debe seguir el formato aaaa/mm/dd"),
    password: z.string().min(1, "La contraseña es requerida"),
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
        const usuarios: Usuario[] = await orm.em.findAll(Usuario, {
            populate: ["*"],
        });

        await orm.em.flush();

        let usuariosSinBorradoLogico = usuarios.filter((u) => u.borradoLogico == false);

        const reponse: ExpressResponse<Usuario[]> = {
            message: "Usuarios encontrados:",
            data: usuariosSinBorradoLogico,
            totalPages: undefined,
        };
        res.json(reponse);
    } catch (error) {
        const reponse: ExpressResponse<Usuario> = {
            message: String(error),
            data: undefined,
            totalPages: undefined,
        };
        res.status(500).send(reponse);
    }
}

async function findAllConBorrado(req: Request, res: Response) {
    try {
        const usuarios: Usuario[] = await orm.em.findAll(Usuario, {
            populate: ["*"],
        });

        await orm.em.flush();

        const reponse: ExpressResponse<Usuario[]> = {
            message: "Usuarios encontrados:",
            data: usuarios,
            totalPages: undefined,
        };
        res.json(reponse);
    } catch (error) {
        const reponse: ExpressResponse<Usuario> = {
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
        const usuario = await findOneUsuario(_id);

        if (!usuario) {
            const reponse: ExpressResponse<Usuario> = {
                message: "Usuario no encontrado",
                data: undefined,
                totalPages: undefined,
            };
            return res.status(404).send(reponse);
        }
        res.json({ data: usuario });
    } catch (error) {
        const reponse: ExpressResponse<Usuario> = {
            message: String(error),
            data: undefined,
            totalPages: undefined,
        };
        res.status(500).send(reponse);
    }
}

async function add(req: Request, res: Response) {
    const usuarioValidation = usuarioSchema.safeParse(req.body);

    if (!usuarioValidation.success) {
        return res.status(400).send({
            message: "Error de validación",
            errors: usuarioValidation.error.errors,
        });
    }

    const { legajo, nombre, apellido, username, fechaNacimiento, password, sexo } = usuarioValidation.data;

    const rol = UserRole.Regular;

    try {
        let usuarioConMismoUsername = await findOneUsuarioByUsername(username);

        if (usuarioConMismoUsername != null) {
            const reponse: ExpressResponse<Usuario> = {
                message: "Ya existe un usuario con ese nombre",
                data: undefined,
                totalPages: undefined,
            };

            return res.status(500).send(reponse);
        }

        const nuevoUsuario = new Usuario(
            nombre,
            legajo,
            apellido,
            username,
            dateFromString(fechaNacimiento),
            rol,
            sexo,
            Usuario.hashPassword(password)
        );

        await orm.em.persist(nuevoUsuario).flush();
        const reponse: ExpressResponse<Usuario> = {
            message: "Usuario creado",
            data: nuevoUsuario,
            totalPages: undefined,
        };

        res.status(201).send(reponse);
    } catch (error) {
        const reponse: ExpressResponse<Usuario> = {
            message: String(error),
            data: undefined,
            totalPages: undefined,
        };

        res.status(500).send(reponse);
    }
}

async function modify(req: Request, res: Response) {
    const _id = req.params.id as string;

    const usuarioValidation = usuarioSchema.partial().safeParse(req.body);

    if (!usuarioValidation.success) {
        return res.status(400).send({
            message: "Error de validación",
            errors: usuarioValidation.error.errors,
        });
    }

    const { legajo, nombre, apellido, username, fechaNacimiento, password, sexo } = usuarioValidation.data;

    try {
        const usuarioAModificar = orm.em.getReference(Usuario, _id);

        if (!usuarioAModificar) {
            const response: ExpressResponse<Usuario> = {
                message: "Usuario no encontrado",
                data: undefined,
                totalPages: undefined,
            };

            return res.status(404).send(response);
        }

        if (nombre) usuarioAModificar.nombre = nombre;
        if (legajo) usuarioAModificar.legajo = legajo;
        if (apellido) usuarioAModificar.apellido = apellido;
        if (username) usuarioAModificar.username = username;
        if (password) usuarioAModificar.hashed_password = Usuario.hashPassword(password);
        if (fechaNacimiento) usuarioAModificar.fechaNacimiento = dateFromString(fechaNacimiento);
        if (sexo) usuarioAModificar.sexo = sexo;

        await orm.em.flush();

        const response: ExpressResponse<Usuario> = {
            message: "Usuario modificado",
            data: usuarioAModificar,
            totalPages: undefined,
        };
        res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Usuario> = {
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
        const usuraioABorrar: Usuario | null = await findOneUsuario(_id);

        if (!usuraioABorrar) {
            const response: ExpressResponse<Usuario> = {
                message: "Usuario no encontrado",
                data: undefined,
                totalPages: undefined,
            };
            return res.status(404).send(response);
        }

        usuraioABorrar.borradoLogico = true;

        let cantReviews = await usuraioABorrar.reviews.load();

        for (let index = 0; index < cantReviews.count(); index++) {
            usuraioABorrar.reviews[index].borradoLogico = true;
        }

        await orm.em.flush();

        const response: ExpressResponse<Usuario> = {
            message: "Usuario borrado",
            data: usuraioABorrar,
            totalPages: undefined,
        };
        res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Usuario> = {
            message: String(error),
            data: undefined,
            totalPages: undefined,
        };
        res.status(500).send(response);
    }
}

async function findOneUsuario(_id: string): Promise<Usuario | null> {
    try {
        const usuario: Usuario | null = await orm.em.findOne(Usuario, _id, {
            populate: ["*"],
        });

        await orm.em.flush();
        return usuario;
    } catch (error) {
        console.error(new Error("Error al buscar el usuario"));
        return null;
    }
}

async function findOneUsuarioByUsername(username: string): Promise<Usuario | null> {
    try {
        const usuario: Usuario | null = await orm.em.findOne(Usuario, { username });

        await orm.em.flush();
        return usuario;
    } catch (error) {
        console.error(new Error("Error al buscar el usuario"));
        return null;
    }
}

export { findAll, findOne, add, modify, delete_, findOneUsuario, findAllConBorrado, findOneUsuarioByUsername };
