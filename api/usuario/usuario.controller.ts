import { Request, Response } from "express";
import { Usuario } from "./usuario.entity.js";
import { ExpressResponse_Migration, Sexo, UserRole } from "../shared/types.js";
import { ExpressResponse } from "../shared/types.js";
import { dateFromString } from "../dateExtension.js";
import { z } from "zod";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";

const usuarioSchema = z.object({
    legajo: z.string().regex(/^\d{5}$/, "El legajo debe constar de 5 digitos"),
    nombre: z.string().regex(/^[a-zA-Z]+$/, "El nombre es requerido"),
    apellido: z.string().regex(/^[a-zA-Z]+$/, "El apellido es requerido"),
    username: z.string().min(1, "El username es requerido"),
    fechaNacimiento: z
        .string()
        .regex(/^(19|20)\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/, {
            message: "La fecha debe estar en formato YYYY/MM/DD.",
        })
        .refine(
            (dateString) => {
                const inputDate = new Date(dateString.replace(/\//g, "-")); // Cambia '/' a '-' para compatibilidad con `Date`
                const today = new Date();

                // Verifica si la fecha es válida
                if (isNaN(inputDate.getTime())) return false;

                // Restar 16 años a la fecha actual para la verificación
                today.setFullYear(today.getFullYear() - 18);
                return inputDate <= today;
            },
            {
                message: "Los usuarios deben ser mayores de 18 años",
            }
        ),
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
    reviewsEliminadas: z.array(z.object({ id: z.string(), mensaje: z.string(), visto: z.boolean() })).optional(),
});

export class UsuarioController {
    private em: MongoEntityManager<MongoDriver>;

    findAll = async (req: Request, res: Response) => {
        try {
            const usuarios: Usuario[] = await this.em.findAll(Usuario, {
                populate: ["*"],
            });

            await this.em.flush();

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
    };

    findAllConBorrado = async (req: Request, res: Response) => {
        try {
            const usuarios: Usuario[] = await this.em.findAll(Usuario, {
                populate: ["*"],
            });

            await this.em.flush();

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
    };

    findOne = async (req: Request, res: Response) => {
        const _id = req.params.id;

        try {
            const usuario = await this.findOneUsuario(_id);

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
    };

    add = async (req: Request, res: Response) => {
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
            let usuarioConMismoUsername = await this.findOneUsuarioByUsername(username);

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

            await this.em.persist(nuevoUsuario).flush();
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
    };

    modify = async (req: Request, res: Response) => {
        const _id = req.params.id as string;

        const usuarioValidation = usuarioSchema.partial().safeParse(req.body);

        if (!usuarioValidation.success) {
            return res.status(400).send({
                message: "Error de validación",
                errors: usuarioValidation.error.errors,
            });
        }

        const { nombre, apellido, username, fechaNacimiento, sexo, reviewsEliminadas } = usuarioValidation.data;

        try {
            const usuarioAModificar = this.em.getReference(Usuario, _id);

            if (!usuarioAModificar) {
                const response: ExpressResponse<Usuario> = {
                    message: "Usuario no encontrado",
                    data: undefined,
                    totalPages: undefined,
                };

                return res.status(404).send(response);
            }

            if (nombre) usuarioAModificar.nombre = nombre;
            if (apellido) usuarioAModificar.apellido = apellido;
            if (username) usuarioAModificar.username = username;
            if (reviewsEliminadas) usuarioAModificar.reviewsEliminadas = reviewsEliminadas;
            if (fechaNacimiento) usuarioAModificar.fechaNacimiento = dateFromString(fechaNacimiento);
            if (sexo) usuarioAModificar.sexo = sexo;

            await this.em.flush();

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
    };

    delete_ = async (req: Request, res: Response) => {
        const _id = req.params.id as string;

        try {
            const usuraioABorrar: Usuario | null = await this.findOneUsuario(_id);

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

            await this.em.flush();

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
    };

    findOneUsuario = async (_id: string): Promise<Usuario | null> => {
        try {
            const usuario: Usuario | null = await this.em.findOne(Usuario, _id, {
                populate: ["*"],
            });

            await this.em.flush();
            return usuario;
        } catch (error) {
            console.error(new Error("Error al buscar el usuario"));
            return null;
        }
    };

    findOneUsuarioByUsername = async (username: string): Promise<Usuario | null> => {
        try {
            const usuario: Usuario | null = await this.em.findOne(Usuario, { username });

            await this.em.flush();
            return usuario;
        } catch (error) {
            console.error(new Error("Error al buscar el usuario"));
            return null;
        }
    };

    getReviewsEliminadas = async (id: string): Promise<ExpressResponse_Migration<Usuario["reviewsEliminadas"]>> => {
        try {
            const response = await this.findOneUsuario(id);
            if (!response)
                return {
                    message: "Usuario not found",
                    error: "Usuario not found",
                    data: null,
                    totalPages: undefined,
                    success: false,
                };

            const usuario = response.reviewsEliminadas!;

            return {
                message: "Deleted reviews found successfully",
                success: true,
                data: usuario,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "Error finding the deleted reviews",
                data: null,
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                totalPages: undefined,
            };
        }
    };

    constructor(em: MongoEntityManager<MongoDriver>) {
        this.em = em;
    }
}
