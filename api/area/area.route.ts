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
         * /reviews:
         *   get:
         *     summary: Retrieve a list of reviews
         *     responses:
         *       200:
         *         description: A list of reviews
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 type: object
         */
        this.instance.get("/", this.controller.findAll);

        /**
         * @swagger
         * /reviews/conBorrado:
         *   get:
         *     summary: Retrieve a list of reviews including deleted ones
         *     responses:
         *       200:
         *         description: A list of reviews including deleted ones
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 type: object
         */
        this.instance.get("/conBorrado", this.controller.findAllConBorrado);

        /**
         * @swagger
         * /reviews/{id}:
         *   get:
         *     summary: Retrieve a single review by ID
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: A single review
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         */
        this.instance.get("/:id", this.controller.findOne);

        /**
         * @swagger
         * /reviews:
         *   post:
         *     summary: Create a new review
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *     responses:
         *       201:
         *         description: The created review
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         */
        this.instance.post("/", this.controller.add);

        /**
         * @swagger
         * /reviews/{id}:
         *   patch:
         *     summary: Update a review by ID
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *     responses:
         *       200:
         *         description: The updated review
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         */
        this.instance.patch("/:id", this.controller.modify);

        /**
         * @swagger
         * /reviews/{id}:
         *   delete:
         *     summary: Delete a review by ID
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       204:
         *         description: No content
         */
        this.instance.delete("/:id", this.controller.delete_);
    }
}
