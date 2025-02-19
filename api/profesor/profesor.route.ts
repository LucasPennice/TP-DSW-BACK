import express, { Router } from "express";
import { ProfesorController } from "./profesor.controller";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { AuthRoute } from "..";
import { Profesor } from "./profesor.entity";

export class ProfesorRouter {
    public instance: Router;
    private controller: ProfesorController;

    constructor(em: MongoEntityManager<MongoDriver>) {
        this.instance = express.Router();
        this.controller = new ProfesorController(em);

        /**
         * @swagger
         * /api/profesor:
         *   get:
         *     summary: Retrieve all profesors
         *     responses:
         *       200:
         *         description: A list of profesors
         */
        this.instance.get("/", async (req, res) => {
            const result = await this.controller.findAll();

            if (!result.success) return res.status(500).json(result);

            res.status(200).json(result);
        });

        /**
         * @swagger
         * /api/profesor/conBorrado:
         *   get:
         *     summary: Retrieve all profesors including deleted ones
         *     responses:
         *       200:
         *         description: A list of profesors including deleted ones
         */
        this.instance.get("/conBorrado", AuthRoute.ensureAdmin, async (req, res) => {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const result = await this.controller.findAllConBorrado(limit, offset);

            if (!result.success) return res.status(500).json(result);

            res.status(200).json(result);
        });
        // this.instance.get("/conBorrado", ensureAdmin, findAllConBorrado);

        /**
         * @swagger
         * /api/profesor/{id}/reviews:
         *   get:
         *     summary: Retrieve reviews for a specific profesor
         *     responses:
         *       200:
         *         description: A list of reviews for the profesor
         */
        this.instance.get("/:id/reviews", async (req, res) => {
            const id = req.params.id as string;

            const result = await this.controller.findReviews(id);

            if (!result.success) return res.status(500).json(result);

            res.status(200).json(result);
        });

        /**
         * @swagger
         * /api/profesor/porMateriaYAno/{ano}/{idMateria}/{anoCursado}:
         *   get:
         *     summary: Retrieve profesors by subject and year of study
         *     responses:
         *       200:
         *         description: A list of profesors by subject and year of study
         */
        this.instance.get("/porMateriaYAno/:ano/:idMateria/:anoCursado", async (req, res) => {
            const idMateria = req.params.idMateria as string;
            const anoMateria = parseInt(req.params.ano) as number;
            const anoCursado = parseInt(req.params.anoCursado) as number;

            const result = await this.controller.findPorMateriaYAnoYAnoCursado(idMateria, anoMateria, anoCursado);

            if (!result.success) return res.status(500).json(result);

            res.status(200).json(result);
        });

        /**
         * @swagger
         * /api/profesor/porMateriaYAno/{ano}/{idMateria}:
         *   get:
         *     summary: Retrieve profesors by subject and year
         *     responses:
         *       200:
         *         description: A list of profesors by subject and year
         */
        this.instance.get("/porMateriaYAno/:ano/:idMateria", async (req, res) => {
            const idMateria = req.params.idMateria as string;
            const anoMateria = parseInt(req.params.ano) as number;

            const result = await this.controller.findPorMateriaYAno(idMateria, anoMateria);

            if (!result.success) return res.status(500).json(result);

            res.status(200).json(result);
        });

        /**
         * @swagger
         * /api/profesor/{id}/reviewsDeMateria/{idMateria}:
         *   get:
         *     summary: Retrieve reviews for a specific profesor and subject
         *     responses:
         *       200:
         *         description: A list of reviews for the profesor and subject
         */
        this.instance.get("/:id/reviewsDeMateria/:idMateria", async (req, res) => {
            const id = req.params.id as string;
            const idMateria = req.params.idMateria as string;

            const result = await this.controller.findReviewsPorMateria(id, idMateria);

            if (!result.success) return res.status(500).json(result);

            res.status(200).json(result);
        });

        /**
         * @swagger
         * /api/profesor/{id}:
         *   get:
         *     summary: Retrieve a single profesor by ID
         *     responses:
         *       200:
         *         description: A single profesor
         */
        this.instance.get("/:id", async (req, res) => {
            const result = await this.controller.findOne(req.params.id);

            if (!result.success) return res.status(500).json(result);

            res.status(200).json(result);
        });

        /**
         * @swagger
         * /api/profesor:
         *   post:
         *     summary: Create a new profesor
         *     responses:
         *       201:
         *         description: The created profesor
         */
        this.instance.post("/", AuthRoute.ensureAdmin, async (req, res) => {
            const parseResult = Profesor.parseSchema(req.body);

            if (!parseResult.success) return res.status(500).json(parseResult);

            const result = await this.controller.add(parseResult.data!);

            if (!result.success) return res.status(500).send(result);

            res.status(201).send(result);
        });

        /**
         * @swagger
         * /api/profesor/{id}:
         *   patch:
         *     summary: Update a profesor by ID
         *     responses:
         *       200:
         *         description: The updated profesor
         */
        this.instance.patch("/:id", AuthRoute.ensureAdmin, async (req, res) => {
            const parseResult = Profesor.parseSchema(req.body);

            if (!parseResult.success) return res.status(500).json(parseResult);

            const result = await this.controller.modify(parseResult.data!, req.params.id);

            if (!result.success) return res.status(500).send(result);

            res.status(201).send(result);
        });

        /**
         * @swagger
         * /api/profesor/{id}:
         *   delete:
         *     summary: Delete a profesor by ID
         *     responses:
         *       204:
         *         description: No content
         */
        this.instance.delete("/:id", AuthRoute.ensureAdmin, async (req, res) => {
            const idToDelete = req.params.id as string;

            const result = await this.controller.delete_(idToDelete);

            if (!result.success) return res.status(500).send(result);

            res.status(204).send(result);
        });
    }
}
