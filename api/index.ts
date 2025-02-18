import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import { MongoDriver, MongoEntityManager, RequestContext } from "@mikro-orm/mongodb";
import cors from "cors";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import crypto from "crypto";
import { SALT_CONSTANT, SALT_DIGEST, SALT_ITERATIONS, SALT_KEYLEN, port } from "./constants.js";
import { ExpressResponse, Sexo, UserRole } from "./shared/types.js";
import { Usuario } from "./usuario/usuario.entity.js";
import { dateFromString } from "./dateExtension.js";
import { UsuarioController } from "./usuario/usuario.controller.js";
import { initORM } from "./orm.js";
import { ProfesorRouter } from "./profesor/profesor.route.js";
import { AreaRouter } from "./area/area.route.js";
import { UsuarioRouter } from "./usuario/usuario.route.js";
import { MateriaRouter } from "./materia/materia.route.js";
import { ReviewRouter } from "./review/review.route.js";
import { CursadoRouter } from "./cursado/cursado.route.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import MongoStore from "connect-mongo";

export async function startServer(port: number, em: MongoEntityManager<MongoDriver>) {
    const orm = await initORM();

    const usuarioController = new UsuarioController(orm.em);

    // Configure Passport Strategy
    // This methods handles how the user will be authenticated
    passport.use(
        new LocalStrategy(async (username, contraseña, done) => {
            const user = await usuarioController.findOneUsuarioByUsername(username);

            if (!user) {
                return done(null, false, { message: "Username incorrecto" });
            }

            if (Usuario.hashPassword(contraseña) != user.hashed_password) {
                return done(null, false, { message: "Incorrect username or password." });
            }

            return done(null, user);
        })
    );

    // This function runs after a successful authentication
    // Serializing the user information into the session
    passport.serializeUser(function (user, cb) {
        console.log("running serializeUser");
        process.nextTick(function () {
            cb(null, user);
        });
    });

    // This function runs after each request to deserialize the user stored
    // in the session
    passport.deserializeUser(function (user: Usuario, cb) {
        console.log("running desrealizeUser");
        process.nextTick(function () {
            return cb(null, user);
        });
    });

    const app = express();

    var options = {
        origin: ["http://localhost:3001", "https://tpdsw.lpenn.dev"],
        credentials: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204,
    };

    app.use(cors(options));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    //@ts-ignore
    // const mongoStore = MongoStore.create({ client: orm.em.getConnection().getClient(), dbName: "test-app" });

    // mongoStore.addListener("create", (a) => {
    //     console.log(a);
    // });
    // Use session middleware
    app.use(
        session({
            secret: "your-secret-key",
            resave: false,
            saveUninitialized: false,
            // store: mongoStore,
            cookie: {
                maxAge: 24 * 60 * 60 * 1000 * 365, // 1 year until session expires
                secure: false, // Set to true if using HTTPS
                httpOnly: true,
            },
        })
    );

    // Initialize Passport
    app.use(passport.initialize());
    app.use(passport.session());

    app.use((req, res, next) => {
        RequestContext.create(orm.em, next);
    });

    const profesorRouter = new ProfesorRouter(em).instance;
    app.use("/api/profesor", profesorRouter);

    const areaRouter = new AreaRouter(em).instance;
    app.use("/api/area", areaRouter);

    const usuarioRouter = new UsuarioRouter(em).instance;
    app.use("/api/usuario", usuarioRouter);

    const materiaRouter = new MateriaRouter(em).instance;
    app.use("/api/materia", materiaRouter);

    const reviewRouter = new ReviewRouter(em).instance;
    app.use("/api/review", reviewRouter);

    const cursadoRouter = new CursadoRouter(em).instance;
    app.use("/api/cursado", cursadoRouter);

    // ⚠️ Borrar eventualmente, solo sirve para testear
    app.get("/testAuth", AuthRoute.ensureAuthenticated, (req, res) => {
        res.send(`
        Directorios: \n
        /api/profesor \n
        /api/usuario \n
        /api/area \n
        /api/materia \n
    `);
    });

    app.get("/login", (req, res) => {
        res.send("Login page");
    });

    // ⚠️ Importante que esta ruta este por debajo de GET - con ruta /login ⚠️
    app.post("/login", (req, res, next) => {
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
                        const reponse: ExpressResponse<Usuario> = { message: "Usuario log", data: user, totalPages: undefined };

                        return res.status(200).send(reponse);
                    }
                });
            }
        })(req, res, next);
    });

    app.post("/logout", function (req, res, next) {
        req.logout(async function (err) {
            if (err) {
                console.error("Logout error:", err);
                res.status(500).json({ message: err, succeed: false });
                return next(err);
            }

            // Limpia los cookies
            // console.log(req.sessionID);
            res.clearCookie("connect.sid", { path: "/" });
            // Manually destroy the session
            await orm.em.nativeDelete("sessions", { _id: req.sessionID });
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
                        const reponse: ExpressResponse<Usuario> = { message: "Error al crear usuario", data: undefined, totalPages: undefined };

                        return res.status(500).json(reponse);
                    } else {
                        const reponse: ExpressResponse<Usuario> = { message: "Usuario creado", data: nuevoUsuario, totalPages: undefined };

                        return res.status(201).send(reponse);
                    }
                });
            } catch (error) {
                const reponse: ExpressResponse<Usuario> = { message: String(error), data: undefined, totalPages: undefined };

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

    const swaggerOptions: swaggerJsdoc.Options = {
        definition: {
            openapi: "3.0.0",
            info: {
                title: "API Documentation",
                version: "1.0.0",
            },
        },
        apis: ["./api/*/**.route.ts"], // Ruta a tus archivos de rutas
    };

    const specs = swaggerJsdoc(swaggerOptions);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

    const server = app.listen(port, () => {
        console.log(`⚡️ App corriendo en puerto: ${port} ⚡️`);
    });

    return { app, server };
}

export class AuthRoute {
    static ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
        if (req.isAuthenticated()) {
            return next();
        }

        return res.status(401).send({ message: "Usuario no autenticado", succeed: false });
    }

    static ensureAdmin(req: Request, res: Response, next: NextFunction) {
        if (!req.isAuthenticated()) {
            return res.status(401).send({ message: "Usuario no autenticado", succeed: false });
        }

        let user = req.user as Usuario;

        if (user.rol != UserRole.Administrador) {
            return res.status(401).send({ message: "El usuario no tiene los permisos necesarios", succeed: false });
        }

        return next();
    }
}
