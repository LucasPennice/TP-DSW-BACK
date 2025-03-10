import { MongoDriver, MongoEntityManager, RequestContext } from "@mikro-orm/mongodb";
import bodyParser from "body-parser";
import cors from "cors";
import crypto from "crypto";
import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { AreaRouter } from "./area/area.route.js";
import { errorToZod, SALT_CONSTANT, SALT_DIGEST, SALT_ITERATIONS, SALT_KEYLEN } from "./constants.js";
import { CursadoRouter } from "./cursado/cursado.route.js";
import { dateFromString } from "./dateExtension.js";
import { MateriaRouter } from "./materia/materia.route.js";
import { initORM } from "./orm.js";
import { ProfesorRouter } from "./profesor/profesor.route.js";
import { ReviewRouter } from "./review/review.route.js";
import { ExpressResponse_Migration, Sexo, UserRole } from "./shared/types.js";
import { UsuarioController } from "./usuario/usuario.controller.js";
import { Usuario } from "./usuario/usuario.entity.js";
import { UsuarioRouter } from "./usuario/usuario.route.js";

export async function startServer(port: number, em: MongoEntityManager<MongoDriver>) {
    const orm = await initORM();

    const usuarioController = new UsuarioController(orm.em);

    // Configure Passport Strategy
    // This methods handles how the user will be authenticated
    passport.use(
        new LocalStrategy(async (username, contraseña, done) => {
            const userReq = await usuarioController.findOneUsuarioByUsername(username);

            if (!userReq.data) {
                return done(null, false, { message: "Username incorrecto" });
            }

            const user = userReq.data!;

            if (Usuario.hashPassword(contraseña) != user.hashed_password) {
                return done(null, false, { message: "Incorrect username or password." });
            }

            return done(null, user);
        })
    );

    // This function runs after a successful authentication
    // Serializing the user information into the session
    // Here's where the session is stored in the database
    passport.serializeUser(function (user, cb) {
        process.nextTick(function () {
            cb(null, user);
        });
    });

    // This function runs after each request to deserialize the user stored in the session
    passport.deserializeUser(async function (deserializedUser: Usuario, cb) {
        process.nextTick(function () {
            return cb(null, deserializedUser);
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

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(
        session({
            secret: "your-secret-key",
            resave: false,
            saveUninitialized: false,
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

    app.get("/api/session-status", (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            res.status(200).json({ success: true });
        } else {
            res.status(200).json({ success: false });
        }
    });

    app.get("/login", (req, res) => {
        res.send("Login page");
    });

    // ⚠️ Importante que esta ruta este por debajo de GET - con ruta /login ⚠️
    app.post("/login", (req, res, next) => {
        passport.authenticate("local", (error: string | null, user: Usuario | false, message: { message: string }) => {
            if (error) {
                const reponse: ExpressResponse_Migration<Usuario> = {
                    message: "Failed to login",
                    data: null,
                    totalPages: undefined,
                    success: false,
                    error: errorToZod(error),
                };
                return res.status(401).json(reponse);
            } else if (!user) {
                const reponse: ExpressResponse_Migration<Usuario> = {
                    message: "User Not found",
                    data: null,
                    totalPages: undefined,
                    success: false,
                };
                return res.status(500).json(reponse);
            } else {
                req.login(user, (err) => {
                    if (err) {
                        const reponse: ExpressResponse_Migration<Usuario> = {
                            message: "Failed to login",
                            data: null,
                            totalPages: undefined,
                            success: false,
                        };
                        return res.status(500).json(reponse);
                    } else {
                        const reponse: ExpressResponse_Migration<Usuario> = {
                            message: "Usuario log",
                            data: { ...user, hashed_password: "" },
                            totalPages: undefined,
                            success: true,
                        };

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

            res.clearCookie("connect.sid", { path: "/" });
        });
    });

    // ⚠️ Importante que esta ruta este por debajo de POST - con ruta /logout ⚠️
    // Como body del post esto quiere dos campos {username: string; password:string}
    app.post("/signup", async function (req, res, next) {
        crypto.pbkdf2(req.body.password, SALT_CONSTANT, SALT_ITERATIONS, SALT_KEYLEN, SALT_DIGEST, async function (err, hashedPassword) {
            if (err) return next(err);

            try {
                const usuarioController = new UsuarioController(em);

                const parseResult = Usuario.parseSchema(req.body);

                if (!parseResult.success) return res.status(500).json(parseResult);

                const result = await usuarioController.add(parseResult.data!);

                if (!result.success) return res.status(500).send(result);

                const user = result.data!;

                req.login(user, (err) => {
                    if (err) {
                        const reponse: ExpressResponse_Migration<Usuario> = {
                            message: "Error al loguear nuevo usuario, creado exitosamente",
                            error: err,
                            success: false,
                            data: null,
                            totalPages: undefined,
                        };

                        return res.status(500).json(reponse);
                    } else {
                        const reponse: ExpressResponse_Migration<Usuario> = {
                            message: "Usuario logueado y creado",
                            data: { ...user, hashed_password: "" },
                            totalPages: undefined,
                            success: true,
                        };

                        return res.status(200).send(reponse);
                    }
                });
            } catch (error) {
                const reponse: ExpressResponse_Migration<Usuario> = {
                    message: "Error during signup",
                    data: null,
                    success: false,
                    totalPages: undefined,
                    error: errorToZod(error instanceof Error ? error.message : "Unknown error"),
                };

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
