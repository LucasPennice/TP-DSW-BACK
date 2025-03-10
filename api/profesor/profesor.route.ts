import express, { Router } from "express";
import { ProfesorController } from "./profesor.controller";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { AuthRoute } from "..";
import { Profesor } from "./profesor.entity";
import { ExpressResponse } from "../shared/types";

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
            const isDeleted = req.query.isDeleted === "true";

            // Require admin permissions to see deleted entities
            if (isDeleted && !AuthRoute.isAdmin(req)) {
                const response: ExpressResponse<Profesor[]> = {
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
         * /api/profesor/{id}/reviews:
         *   get:
         *     summary: Retrieve reviews for a specific profesor
         *     responses:
         *       200:
         *         description: A list of reviews for the profesor
         */
        this.instance.get("/:id/reviews", async (req, res) => {
            const id = req.params.id as string;

            const idMateria = req.query.idMateria;

            let result;

            if (idMateria) {
                result = await this.controller.findReviewsPorMateria(id, idMateria.toString());
            } else {
                result = await this.controller.findReviews(id);
            }

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
        this.instance.post("/", AuthRoute.ensureAdminMiddleware, async (req, res) => {
            const parseResult = Profesor.parseSchema({ ...req.body, fechaNacimiento: new Date(req.body.fechaNacimiento) });

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
        this.instance.patch("/:id", AuthRoute.ensureAdminMiddleware, async (req, res) => {
            const parseResult = Profesor.parseSchema({ ...req.body, fechaNacimiento: new Date(req.body.fechaNacimiento) });

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
