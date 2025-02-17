import express, { Router } from "express";
import { AreaController } from "./area.controller.js";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";

// areaRouter.get("/", findAll);

// areaRouter.get("/conBorrado", ensureAdmin, findAllConBorrado);

// areaRouter.get("/:id", findOne);

// areaRouter.post("/", ensureAdmin, add);

// areaRouter.patch("/:id", ensureAdmin, modify);

// areaRouter.delete("/:id", ensureAdmin, delete_);

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
        this.instance.get("/", this.controller.findAll);

        /**
         * @swagger
         * /api/review/conBorrado:
         *   get:
         *     summary: Retrieve a list of reviews including deleted ones
         *     responses:
         *       200:
         *         description: A list of reviews including deleted ones
         */
        this.instance.get("/conBorrado", this.controller.findAllConBorrado);

        /**
         * @swagger
         * /api/review/{id}:
         *   get:
         *     summary: Retrieve a single review by ID
         *     responses:
         *       200:
         *         description: A single review
         */
        this.instance.get("/:id", this.controller.findOne);

        /**
         * @swagger
         * /api/review:
         *   post:
         *     summary: Create a new review
         *     responses:
         *       201:
         *         description: The created review
         */
        this.instance.post("/", this.controller.add);

        /**
         * @swagger
         * /api/review/{id}:
         *   patch:
         *     summary: Update a review by ID
         *     responses:
         *       200:
         *         description: The updated review
         */
        this.instance.patch("/:id", this.controller.modify);

        /**
         * @swagger
         * /api/review/{id}:
         *   delete:
         *     summary: Delete a review by ID
         *     responses:
         *       204:
         *         description: No content
         */
        this.instance.delete("/:id", this.controller.delete_);
    }
}
