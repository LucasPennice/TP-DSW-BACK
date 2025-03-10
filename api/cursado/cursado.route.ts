import express, { Router } from "express";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { CursadoController } from "./cursado.controller.js";
import { AuthRoute } from "../index.js";
import { Cursado } from "./cursado.entity.js";
import { MateriaController } from "../materia/materia.controller.js";
import { ProfesorController } from "../profesor/profesor.controller.js";

export class CursadoRouter {
    public instance: Router;
    private controller: CursadoController;
    private materiaController: MateriaController;
    private profesorController: ProfesorController;

    constructor(em: MongoEntityManager<MongoDriver>) {
        this.instance = express.Router();
        this.controller = new CursadoController(em);
        this.materiaController = new MateriaController(em);
        this.profesorController = new ProfesorController(em);

        /**
         * @swagger
         * /api/cursado:
         *   get:
         *     summary: Retrieve a list of cursados
         *     responses:
         *       200:
         *         description: A list of cursados
         */
        this.instance.get("/", async (req, res) => {
            const result = await this.controller.findAll();

            if (!result.success) return res.status(500).json(result);

            res.status(200).json(result);
        });

        /**
         * @swagger
         * /api/cursado/conBorrado:
         *   get:
         *     summary: Retrieve a list of cursados including deleted ones
         *     responses:
         *       200:
         *         description: A list of cursados including deleted ones
         */
        this.instance.get("/conBorrado", AuthRoute.ensureAdminMiddleware, async (req, res) => {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const result = await this.controller.findAllConBorrado(limit, offset);

            if (!result.success) return res.status(500).json(result);

            res.status(200).json(result);
        });

        /**
         * @swagger
         * /api/cursado/{id}:
         *   get:
         *     summary: Retrieve a single cursado by ID
         *     responses:
         *       200:
         *         description: A single cursado
         */
        this.instance.get("/:id", async (req, res) => {
            const result = await this.controller.findOne(req.params.id);

            if (!result.success) return res.status(500).json(result);

            res.status(200).json(result);
        });

        /**
         * @swagger
         * /api/cursado:
         *   post:
         *     summary: Create a new cursado
         *     responses:
         *       201:
         *         description: The created cursado
         */
        this.instance.post("/", AuthRoute.ensureAdminMiddleware, async (req, res) => {
            const materiaId = req.body.materiaId;
            const profesorId = req.body.profesorId;

            const parseResult = Cursado.parseSchema(req.body, req.method);

            if (!parseResult.success) return res.status(500).json(parseResult);

            const nuevoCursado = parseResult.data!;

            const result = await this.controller.add(nuevoCursado, materiaId, profesorId);

            if (!result.success) return res.status(500).send(result);

            res.status(201).send(result);
        });

        /**
         * @swagger
         * /api/cursado/{id}:
         *   patch:
         *     summary: Update a cursado by ID
         *     responses:
         *       200:
         *         description: The updated cursado
         */
        this.instance.patch("/:id", AuthRoute.ensureAdminMiddleware, async (req, res) => {
            const findCursadoReq = await this.controller.findOne(req.params.id);

            if (!findCursadoReq.success) return res.status(500).json(findCursadoReq);

            const parseResult = Cursado.parseSchema(req.body, req.method);

            if (!parseResult.success) return res.status(500).json(parseResult);

            const result = await this.controller.modify(parseResult.data!, req.params.id);

            if (!result.success) return res.status(500).send(result);

            res.status(201).send(result);
        });

        /**
         * @swagger
         * /api/cursado/{id}:
         *   delete:
         *     summary: Delete a cursado by ID
         *     responses:
         *       200:
         *         description: No content
         */
        this.instance.delete("/:id", AuthRoute.ensureAdminMiddleware, async (req, res) => {
            const idToDelete = req.params.id as string;

            const result = await this.controller.delete_(idToDelete);

            if (!result.success) return res.status(500).send(result);

            res.status(200).send(result);
        });
    }
}
