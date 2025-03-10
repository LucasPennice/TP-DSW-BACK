import express, { Router } from "express";
import { UsuarioController } from "./usuario.controller";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { AuthRoute } from "..";
import { Usuario } from "./usuario.entity";
import { ExpressResponse } from "../shared/types";

export class UsuarioRouter {
    public instance: Router;
    private controller: UsuarioController;

    constructor(em: MongoEntityManager<MongoDriver>) {
        this.instance = express.Router();
        this.controller = new UsuarioController(em);

        /**
         * @swagger
         * /api/usuario:
         *   get:
         *     summary: Retrieve all usuarios
         *     responses:
         *       200:
         *         description: A list of usuarios
         */
        this.instance.get("/", async (req, res) => {
            const isDeleted = req.query.isDeleted === "true";

            // Require admin permissions to see deleted entities
            if (isDeleted && !AuthRoute.isAdmin(req)) {
                const response: ExpressResponse<Usuario[]> = {
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
         * /api/usuario/{id}:
         *   get:
         *     summary: Retrieve a single usuario by ID
         *     responses:
         *       200:
         *         description: A single usuario
         */
        this.instance.get("/:id", async (req, res) => {
            const result = await this.controller.findOne(req.params.id);

            if (!result.success) return res.status(500).json(result);

            res.status(200).json(result);
        });

        /**
         * @swagger
         * /api/usuario:
         *   post:
         *     summary: Create a new usuario
         *     responses:
         *       201:
         *         description: The created usuario
         */
        this.instance.post("/", async (req, res) => {
            const parseResult = Usuario.parseSchema(req.body);

            if (!parseResult.success) return res.status(500).json(parseResult);

            const result = await this.controller.add(parseResult.data!);

            if (!result.success) return res.status(500).send(result);

            res.status(201).send(result);
        });

        /**
         * @swagger
         * /api/usuario/{id}:
         *   patch:
         *     summary: Update a usuario by ID
         *     responses:
         *       200:
         *         description: The updated usuario
         */
        this.instance.patch("/:id", async (req, res) => {
            const parseResult = Usuario.schema.partial().safeParse(req.body);

            if (!parseResult.success) return res.status(500).json(parseResult);

            // @ts-ignore
            const result = await this.controller.modify(parseResult.data!, req.params.id);

            if (!result.success) return res.status(500).send(result);

            res.status(201).send(result);
        });

        /**
         * @swagger
         * /api/usuario/{id}:
         *   delete:
         *     summary: Delete a usuario by ID
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

        /**
         * @swagger
         * /api/usuario/reviewsEliminadas/{id}:
         *   delete:
         *     summary: Get user's deleted reviews by ID
         *     responses:
         *       200:
         *         description: No content
         */
        this.instance.get("/reviewsEliminadas/:id", async (req, res) => {
            const result = await this.controller.getReviewsEliminadas(req.params.id);

            if (!result.success) return res.status(500).send(result);

            res.status(201).send(result);
        });
    }
}
