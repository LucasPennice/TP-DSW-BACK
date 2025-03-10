import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { ExpressResponse, UserRole } from "../shared/types.js";
import { Usuario } from "./usuario.entity.js";
import { errorToZod } from "../constants.js";
import { ReviewController } from "../review/review.controller.js";

export class UsuarioController {
    private em: MongoEntityManager<MongoDriver>;

    findAll = async (offset?: number, limit: number = 0, isDeleted: boolean = false): Promise<ExpressResponse<Usuario[]>> => {
        try {
            const [usuarios, total] = await this.em.findAndCount(
                Usuario,
                { $or: [{ borradoLogico: isDeleted }, { borradoLogico: false }] },
                {
                    populate: ["*"],
                    limit,
                    offset,
                }
            );

            console.log(total);

            await this.em.flush();

            const boundLimit = limit <= 0 ? 1 : limit;
            const totalPages = limit === 0 ? undefined : Math.ceil(total / boundLimit);

            return {
                message: "Usuarios encontrados",
                success: true,
                data: usuarios,
                totalPages,
            };
        } catch (error) {
            return {
                message: "There was an finding the cursado",
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    add = async (newUsuario: Usuario): Promise<ExpressResponse<Usuario>> => {
        try {
            newUsuario.rol = UserRole.Regular;

            let usuarioConMismoUsername = await this.findOneUsuarioByUsername(newUsuario.username);

            if (usuarioConMismoUsername.data != null)
                return {
                    message: "Ya existe un usuario con ese nombre",
                    success: false,
                    data: null,
                    totalPages: undefined,
                };

            await this.em.persist(newUsuario).flush();

            return {
                message: "Usuario creado",
                success: true,
                data: newUsuario,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "There was an finding the cursado",
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    modify = async (usuarioMod: Partial<Usuario>, usuarioId: string): Promise<ExpressResponse<Usuario>> => {
        try {
            const usuarioAModificar = this.em.getReference(Usuario, usuarioId);

            if (!usuarioAModificar)
                return {
                    message: "Usuario not found",
                    data: null,
                    totalPages: undefined,
                    success: false,
                };

            if (usuarioMod.nombre) usuarioAModificar.nombre = usuarioMod.nombre;
            if (usuarioMod.apellido) usuarioAModificar.apellido = usuarioMod.apellido;
            if (usuarioMod.username) usuarioAModificar.username = usuarioMod.username;
            if (usuarioMod.reviewsEliminadas) usuarioAModificar.reviewsEliminadas = usuarioMod.reviewsEliminadas;
            if (usuarioMod.fechaNacimiento) usuarioAModificar.fechaNacimiento = usuarioMod.fechaNacimiento;
            if (usuarioMod.sexo) usuarioAModificar.sexo = usuarioMod.sexo;

            await this.em.flush();

            return {
                message: "Usuario modificado",
                success: true,
                data: usuarioAModificar,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "There was an finding the cursado",
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    delete_ = async (_id: string): Promise<ExpressResponse<Usuario>> => {
        try {
            const findUsuarioReq = await this.findOne(_id);

            if (!findUsuarioReq.success)
                return {
                    message: "Usuario not found",
                    data: null,
                    totalPages: undefined,
                    success: false,
                };

            const usuraioABorrar = findUsuarioReq.data!;

            usuraioABorrar.borradoLogico = true;
            //@ts-ignore
            const ids = (await usuraioABorrar.reviews.load({ populate: ["_id"] })).toArray().map((x) => x.id);
            const reviewController = new ReviewController(this.em);
            ids.forEach(async (id) => {
                await reviewController.delete_(id);
            });

            await this.em.flush();

            return {
                message: "Usuario borrado",
                success: true,
                data: usuraioABorrar,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "There was an finding the cursado",
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    findOne = async (_id: string): Promise<ExpressResponse<Usuario>> => {
        try {
            const usuario: Usuario | null = await this.em.findOne(Usuario, _id, {
                populate: ["*"],
            });

            if (!usuario)
                return {
                    message: "Usuario not found",
                    success: false,
                    data: null,
                    totalPages: undefined,
                };

            await this.em.flush();

            return {
                message: "Usuario encontrado",
                success: true,
                data: usuario,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "There was an finding the cursado",
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    findOneUsuarioByUsername = async (username: string): Promise<ExpressResponse<Usuario>> => {
        try {
            const usuario: Usuario | null = await this.em.findOne(Usuario, { username });

            if (!usuario)
                return {
                    message: "Usuario not found",
                    success: true,
                    data: null,
                    totalPages: undefined,
                };

            await this.em.flush();

            return {
                message: "Usuario encontrado",
                success: true,
                data: usuario,
                totalPages: undefined,
            };
        } catch (error) {
            return {
                message: "There was an finding the cursado",
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                success: false,
                data: null,
                totalPages: undefined,
            };
        }
    };

    getReviewsEliminadas = async (id: string): Promise<ExpressResponse<Usuario["reviewsEliminadas"]>> => {
        try {
            const findUsuarioReq = await this.findOne(id);

            if (!findUsuarioReq.success)
                return {
                    message: "Usuario not found",
                    data: null,
                    totalPages: undefined,
                    success: false,
                };

            const usuario = findUsuarioReq.data!.reviewsEliminadas;

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
                error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                totalPages: undefined,
            };
        }
    };

    constructor(em: MongoEntityManager<MongoDriver>) {
        this.em = em;
    }
}
