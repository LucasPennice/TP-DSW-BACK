import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import express, { Router } from "express";
import { AuthRoute } from "..";
import { MateriaController } from "./materia.controller";
import { Materia } from "./materia.entity";
import { ExpressResponse } from "../shared/types";

export class MateriaRouter {
    public instance: Router;
    private controller: MateriaController;

    constructor(em: MongoEntityManager<MongoDriver>) {
        this.instance = express.Router();
        this.controller = new MateriaController(em);

        /**
         * @swagger
         * /api/materia:
         *   get:
         *     summary: Retrieve a list of materias
         *     responses:
         *       200:
         *         description: A list of materias
         */
        this.instance.get("/", async (req, res) => {
            const isDeleted = req.query.isDeleted === "true";

            // Require admin permissions to see deleted entities
            if (isDeleted && !AuthRoute.isAdmin(req)) {
                const response: ExpressResponse<Materia[]> = {
                    success: false,
                    message: "Forbidden",
                    data: null,
                    totalPages: undefined,
                };
                return res.status(403).send(response);
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const result = await this.controller.findAll(offset, limit, isDeleted);

            if (!result.success) return res.status(500).json(result);

            res.status(200).json(result);
        });

        /**
         * @swagger
         * /api/materia/porAno/{id}:
         *   get:
         *     summary: Retrieve a list of materias by year
         *     responses:
         *       200:
         *         description: A list of materias by year
         */
        this.instance.get("/porAno/:id", async (req, res, next) => {
            const idAno = parseInt(req.params.id);

            const result = await this.controller.findMateriasPorAno(idAno);

            if (!result.success) return res.status(500).json(result);

            res.status(200).json(result);
        });

        /**
         * @swagger
         * /api/materia/{id}:
         *   get:
         *     summary: Retrieve a single materia by ID
         *     responses:
         *       200:
         *         description: A single materia
         */
        this.instance.get("/:id", async (req, res) => {
            const result = await this.controller.findOne(req.params.id);

            if (!result.success) return res.status(500).json(result);

            res.status(200).json(result);
        });

        /**
         * @swagger
         * /api/materia:
         *   post:
         *     summary: Create a new materia
         *     responses:
         *       201:
         *         description: The created materia
         */
        this.instance.post("/", AuthRoute.ensureAdminMiddleware, async (req, res) => {
            const areaId = req.body.areaId;

            const parseResult = Materia.parseSchema(req.body, req.method);

            if (!parseResult.success) return res.status(500).json(parseResult);

            const newMateria = parseResult.data!;

            const result = await this.controller.add(newMateria, areaId);

            if (!result.success) return res.status(500).send(result);

            res.status(201).send(result);
        });

        /**
         * @swagger
         * /api/materia/{id}:
         *   patch:
         *     summary: Update a materia by ID
         *     responses:
         *       200:
         *         description: The updated materia
         */
        this.instance.patch("/:id", AuthRoute.ensureAdminMiddleware, async (req, res) => {
            const parseResult = Materia.parseSchema(req.body, req.method);

            if (!parseResult.success) return res.status(500).json(parseResult);

            const result = await this.controller.modify(parseResult.data!, req.params.id);

            if (!result.success) return res.status(500).send(result);

            res.status(201).send(result);
        });

        /**
         * @swagger
         * /api/materia/{id}:
         *   delete:
         *     summary: Delete a materia by ID
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
