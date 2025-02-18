import express, { Router } from "express";
import { UsuarioController } from "./usuario.controller";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";

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
        this.instance.get("/", this.controller.findAll);

        /**
         * @swagger
         * /api/usuario/conBorrado:
         *   get:
         *     summary: Retrieve all usuarios including deleted ones
         *     responses:
         *       200:
         *         description: A list of usuarios including deleted ones
         */
        this.instance.get("/conBorrado", this.controller.findAllConBorrado);

        /**
         * @swagger
         * /api/usuario/{id}:
         *   get:
         *     summary: Retrieve a single usuario by ID
         *     responses:
         *       200:
         *         description: A single usuario
         */
        this.instance.get("/:id", this.controller.findOne);

        /**
         * @swagger
         * /api/usuario:
         *   post:
         *     summary: Create a new usuario
         *     responses:
         *       201:
         *         description: The created usuario
         */
        this.instance.post("/", this.controller.add);

        /**
         * @swagger
         * /api/usuario/{id}:
         *   patch:
         *     summary: Update a usuario by ID
         *     responses:
         *       200:
         *         description: The updated usuario
         */
        this.instance.patch("/:id", this.controller.modify);

        /**
         * @swagger
         * /api/usuario/{id}:
         *   delete:
         *     summary: Delete a usuario by ID
         *     responses:
         *       204:
         *         description: No content
         */
        this.instance.delete("/:id", this.controller.delete_);

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
