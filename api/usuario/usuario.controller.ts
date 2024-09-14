import { Request, Response } from "express";
import { Usuario } from "./usuario.entity.js";
import { Sexo, UserRole } from "../shared/types.js";
import { ExpressResponse } from "../shared/types.js";
import { orm } from "../orm.js";
import { dateFromString } from "../dateExtension.js";

type _Body = Omit<Partial<Usuario>, "_id">;

async function findAll(req: Request, res: Response) {
    try {
        const usuarios: Usuario[] = await orm.em.findAll(Usuario, {
            populate: ["*"],
        });

        await orm.em.flush();

        let usuariosSinBorradoLogico = usuarios.filter((u) => u.borradoLogico == false);

        const reponse: ExpressResponse<Usuario[]> = { message: "Usuarios encontrados:", data: usuariosSinBorradoLogico };
        res.json(reponse);
    } catch (error) {
        const reponse: ExpressResponse<Usuario> = { message: String(error), data: undefined };
        res.status(500).send(reponse);
    }
}

async function findAllConBorrado(req: Request, res: Response) {
    try {
        const usuarios: Usuario[] = await orm.em.findAll(Usuario, {
            populate: ["*"],
        });

        await orm.em.flush();

        const reponse: ExpressResponse<Usuario[]> = { message: "Usuarios encontrados:", data: usuarios };
        res.json(reponse);
    } catch (error) {
        const reponse: ExpressResponse<Usuario> = { message: String(error), data: undefined };
        res.status(500).send(reponse);
    }
}

async function findOne(req: Request, res: Response) {
    const _id = req.params.id;

    try {
        const usuario = await findOneUsuario(_id);

        if (!usuario) {
            const reponse: ExpressResponse<Usuario> = { message: "Usuario no encontrado", data: undefined };
            return res.status(404).send(reponse);
        }
        res.json({ data: usuario });
    } catch (error) {
        const reponse: ExpressResponse<Usuario> = { message: String(error), data: undefined };
        res.status(500).send(reponse);
    }
}

async function add(req: Request, res: Response) {
    const nombre = req.body.nombre as string;
    const legajo = req.body.legajo as string;
    const apellido = req.body.apellido as string;
    const username = req.body.username as string;
    const contraseña = req.body.contraseña as string;
    const fechaNacimiento = req.body.fechaNacimiento as string;
    const rol = req.body.rol as UserRole;
    const sexoTentativo = req.body.sexo as string;
    const sexo: Sexo = sexoTentativo == Sexo.Hombre ? Sexo.Hombre : Sexo.Mujer;

    // 🚨 VALIDAR CON ZOD 🚨

    const nuevoUsuario = new Usuario(
        nombre,
        legajo,
        apellido,
        username,
        dateFromString(fechaNacimiento),
        rol,
        sexo,
        Usuario.hashPassword(contraseña)
    );

    try {
        await orm.em.persist(nuevoUsuario).flush();
        const reponse: ExpressResponse<Usuario> = { message: "Usuario creado", data: nuevoUsuario };

        res.status(201).send(reponse);
    } catch (error) {
        const reponse: ExpressResponse<Usuario> = { message: String(error), data: undefined };

        res.status(500).send(reponse);
    }
}

async function modify(req: Request, res: Response) {
    const _id = req.params.id as string;

    const nombre = req.body.nombre as string | undefined;
    const legajo = req.body.legajo as string | undefined;
    const apellido = req.body.apellido as string | undefined;
    const username = req.body.username as string | undefined;
    const fechaNacimiento = dateFromString(req.body.fechaNacimiento) as Date | undefined;
    const rol = req.body.rol as UserRole | undefined;
    const sexoTentativo = req.body.sexo as string | undefined;
    const contraseña = req.body.contraseña as string | undefined;

    try {
        const usuarioAModificar = orm.em.getReference(Usuario, _id);

        if (!usuarioAModificar) {
            const response: ExpressResponse<Usuario> = { message: "Usuario no encontrado", data: undefined };

            return res.status(404).send(response);
        }

        if (nombre) usuarioAModificar.nombre = nombre;
        if (legajo) usuarioAModificar.legajo = legajo;
        if (apellido) usuarioAModificar.apellido = apellido;
        if (username) usuarioAModificar.username = username;
        if (contraseña) usuarioAModificar.hashed_password = Usuario.hashPassword(contraseña);
        if (fechaNacimiento) usuarioAModificar.fechaNacimiento = fechaNacimiento;
        if (rol) usuarioAModificar.rol = rol;
        if (sexoTentativo) {
            const sexo: Sexo = sexoTentativo == Sexo.Hombre ? Sexo.Hombre : Sexo.Mujer;
            usuarioAModificar.sexo = sexo;
        }

        await orm.em.flush();

        const response: ExpressResponse<Usuario> = { message: "Usuario modificado", data: usuarioAModificar };
        res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Usuario> = { message: String(error), data: undefined };
        res.status(500).send(response);
    }
}

async function delete_(req: Request, res: Response) {
    const _id = req.params.id as string;

    try {
        const usuraioABorrar = orm.em.getReference(Usuario, _id);

        if (!usuraioABorrar) {
            const response: ExpressResponse<Usuario> = { message: "Usuario no encontrado", data: undefined };
            return res.status(404).send(response);
        }

        usuraioABorrar.borradoLogico = true;
        await orm.em.flush();

        const response: ExpressResponse<Usuario> = { message: "Usuario borrado", data: usuraioABorrar };
        res.status(200).send(response);
    } catch (error) {
        const response: ExpressResponse<Usuario> = { message: String(error), data: undefined };
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

export { findAll, findOne, add, modify, delete_, findOneUsuario, findAllConBorrado };
