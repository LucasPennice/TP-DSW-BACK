import express, { Router } from "express";
import { AreaController } from "./area.controller.js";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { Area } from "./area.entity.js";
import { AuthRoute } from "../index.js";
import { ExpressResponse } from "../shared/types.js";

export class AreaRouter {
    public instance: Router;
    private controller: AreaController;

    constructor(em: MongoEntityManager<MongoDriver>) {
        this.instance = express.Router();
        this.controller = new AreaController(em);

        /**
         * @swagger
         * /api/review:
         *   get:
         *     summary: Retrieve a list of reviews
         *     responses:
         *       200:
         *         description: A list of reviews
         */
        this.instance.get("/", async (req, res) => {
            const isDeleted = req.query.isDeleted === "true";

            // Require admin permissions to see deleted entities
            if (isDeleted && !AuthRoute.isAdmin(req)) {
                const response: ExpressResponse<Area[]> = {
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
         * /api/review/{id}:
         *   get:
         *     summary: Retrieve a single review by ID
         *     responses:
         *       200:
         *         description: A single review
         */
        this.instance.get("/:id", async (req, res) => {
            const result = await this.controller.findOne(req.params.id);

            if (!result.success) return res.status(500).json(result);

            res.status(200).json(result);
        });

        /**
         * @swagger
         * /api/review:
         *   post:
         *     summary: Create a new review
         *     responses:
         *       201:
         *         description: The created review
         */
        this.instance.post("/", AuthRoute.ensureAdminMiddleware, async (req, res) => {
            const parseResult = Area.parseSchema(req.body);
            console.log(parseResult);

            if (!parseResult.success) return res.status(500).json(parseResult);

            const result = await this.controller.add(parseResult.data!);

            if (!result.success) return res.status(500).send(result);

            res.status(201).send(result);
        });

        /**
         * @swagger
         * /api/review/{id}:
         *   patch:
         *     summary: Update a review by ID
         *     responses:
         *       200:
         *         description: The updated review
         */
        this.instance.patch("/:id", AuthRoute.ensureAdminMiddleware, async (req, res) => {
            const parseResult = Area.parseSchema(req.body);

            if (!parseResult.success) return res.status(500).json(parseResult);

            const result = await this.controller.modify(parseResult.data!, req.params.id);

            if (!result.success) return res.status(500).send(result);

            res.status(201).send(result);
        });

        /**
         * @swagger
         * /api/review/{id}:
         *   delete:
         *     summary: Delete a review by ID
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
