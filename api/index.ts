import express, { NextFunction, Request, Response } from "express";
import profesorRouter from "./profesor/profesor.route.js";
import usuarioRouter from "./usuario/usuario.route.js";
import bodyParser from "body-parser";
import { RequestContext } from "@mikro-orm/mongodb";
import { orm } from "./orm.js";
import materiaRouter from "./materia/materia.route.js";
import reviewRouter from "./review/review.route.js";
import areaRouter from "./area/area.route.js";
import cursadoRouter from "./cursado/cursado.route.js";
import cors from "cors";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import crypto from "crypto";
import { SALT_CONSTANT, SALT_DIGEST, SALT_ITERATIONS, SALT_KEYLEN, port } from "./constants.js";
import { ExpressResponse, Sexo, UserRole } from "./shared/types.js";
import { Usuario } from "./usuario/usuario.entity.js";
import { dateFromString } from "./dateExtension.js";
import { findOneUsuarioByUsername } from "./usuario/usuario.controller.js";

// Configure Passport Strategy
passport.use(
    new LocalStrategy(async (username, contraseña, done) => {
        // Buscar el usuario en la base de datos 🚨 Cambiar por buscar en la base de datos real despues 🚨
        const user = await findOneUsuarioByUsername(username);

        if (!user) {
            return done(null, false, { message: "Username incorrecto" });
        }

        if (Usuario.hashPassword(contraseña) != user.hashed_password) {
            return done(null, false, { message: "Incorrect username or password." });
        }

        return done(null, user);
    })
);

// 🚨 Es MUY probable que aca haya problemas porque en nuestro tipo de datos identificamos con _id y parece que esperan id
// Pero no me deja castear
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, user);
    });
});

passport.deserializeUser(function (user: Usuario, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
        return next();
    }

    return res.status(401).send({ message: "Not Allowed", succeed: false });
}
/**
 * Registers a function used to deserialize user objects out of the session.
 *
 * Examples:
 *
 *  app.get('/protected', ensureAuthenticated, (req, res) => {
 *    res.send('This is a protected route');
 *  });
 */

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use session middleware
app.use(
    session({
        secret: "your-secret-key",
        resave: false,
        saveUninitialized: false,
    })
);
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    RequestContext.create(orm.em, next);
});

app.use("/api/profesor", profesorRouter);
app.use("/api/area", areaRouter);
app.use("/api/usuario", usuarioRouter);
app.use("/api/materia", materiaRouter);
app.use("/api/review", reviewRouter);
app.use("/api/cursado", cursadoRouter);

// ⚠️ Borrar eventualmente, solo sirve para testear
app.get("/testAuth", ensureAuthenticated, (req, res) => {
    res.send(`
  Directorios: \n
  /api/profesor \n
  /api/usuario \n
  /api/area \n
  /api/materia \n
  `);
});

// ⚠️ Borrar eventualmente, solo sirve para testear
app.get("/profile", (req, res) => {
    if (req.isAuthenticated()) {
        res.send("Welcome to your profile");
    } else {
        res.redirect("/login");
    }
});

// ⚠️ Borrar eventualmente, solo sirve para testear
app.get("/login", (req, res) => {
    res.send("Login page");
});

// ⚠️ Importante que esta ruta este por debajo de GET - con ruta /login ⚠️
// Como body del post esto quiere dos campos {username: string; password:string}
app.post("/login", (req, res, next) => {
    // ⚠️ SUPONGO que estos son los tipos
    passport.authenticate("local", (error: string | null, user: Usuario | false, message: { message: string }) => {
        if (error) {
            return res.status(401).json({ message: error, succeed: false });
        } else if (!user) {
            return res.status(500).json({ message: message.message, succeed: false });
        } else {
            req.login(user, (err) => {
                if (err) {
                    return res.status(500).json({ message: "Failed to login", succeed: false });
                } else {
                    const reponse: ExpressResponse<Usuario> = { message: "Usuario log", data: user };

                    return res.status(200).send(reponse);
                }
            });
        }
    })(req, res, next);
});

app.post("/logout", function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            res.status(500).json({ message: err, succeed: false });
            return next(err);
        }
        return res.status(200).json({ message: "Success", succeed: true });
    });
});

// ⚠️ Importante que esta ruta este por debajo de POST - con ruta /logout ⚠️
// Como body del post esto quiere dos campos {username: string; password:string}
app.post("/signup", async function (req, res, next) {
    crypto.pbkdf2(req.body.password, SALT_CONSTANT, SALT_ITERATIONS, SALT_KEYLEN, SALT_DIGEST, async function (err, hashedPassword) {
        if (err) {
            return next(err);
        }
        const nombre = req.body.nombre as string;
        const legajo = req.body.legajo as string;
        const apellido = req.body.apellido as string;
        const username = req.body.username as string;
        const password = req.body.password as string;
        const fechaNacimiento = req.body.fechaNacimiento as string;
        const rol = UserRole.Regular;
        const sexoTentativo = req.body.sexo as string;
        const sexo: Sexo = sexoTentativo == Sexo.Hombre ? Sexo.Hombre : Sexo.Mujer;

        try {
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

            req.login(nuevoUsuario, (err) => {
                if (err) {
                    const reponse: ExpressResponse<Usuario> = { message: "Error al crear usuario", data: undefined };

                    return res.status(500).json(reponse);
                } else {
                    const reponse: ExpressResponse<Usuario> = { message: "Usuario creado", data: nuevoUsuario };

                    return res.status(201).send(reponse);
                }
            });
        } catch (error) {
            const reponse: ExpressResponse<Usuario> = { message: String(error), data: undefined };

            res.status(500).send(reponse);
        }
    });
});

app.get("/", (req, res) => {
    res.send(`
  Directorios: \n
  /api/profesor \n
  /api/usuario \n
  /api/area \n
  /api/materia \n
  `);
});

app.listen(port, () => {
    console.log(`⚡️ App corriendo en puerto: ${port} ⚡️`);
});
