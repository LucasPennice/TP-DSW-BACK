import express, { Router } from "express";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { CursadoController } from "./cursado.controller.js";

const cursadoRouter = express.Router();

// cursadoRouter.get("/", findAll);

// cursadoRouter.get("/conBorrado", ensureAdmin, findAllConBorrado);

// cursadoRouter.get("/:id", findOne);

// cursadoRouter.post("/", ensureAdmin, add);

// cursadoRouter.patch("/:id", ensureAdmin, modify);

// cursadoRouter.delete("/:id", ensureAdmin, delete_);

export class CursadoRouter {
    public instance: Router;
    private controller: CursadoController;

    constructor(em: MongoEntityManager<MongoDriver>) {
        this.instance = express.Router();
        this.controller = new CursadoController(em);

        /**
         * @swagger
         * /api/cursado:
         *   get:
         *     summary: Retrieve a list of cursados
         *     responses:
         *       200:
         *         description: A list of cursados
         */
        this.instance.get("/", this.controller.findAll);

        /**
         * @swagger
         * /api/cursado/conBorrado:
         *   get:
         *     summary: Retrieve a list of cursados including deleted ones
         *     responses:
         *       200:
         *         description: A list of cursados including deleted ones
         */
        this.instance.get("/conBorrado", this.controller.findAllConBorrado);

        /**
         * @swagger
         * /api/cursado/{id}:
         *   get:
         *     summary: Retrieve a single cursado by ID
         *     responses:
         *       200:
         *         description: A single cursado
         */
        this.instance.get("/:id", this.controller.findOne);

        /**
         * @swagger
         * /api/cursado:
         *   post:
         *     summary: Create a new cursado
         *     responses:
         *       201:
         *         description: The created cursado
         */
        this.instance.post("/", this.controller.add);

        /**
         * @swagger
         * /api/cursado/{id}:
         *   patch:
         *     summary: Update a cursado by ID
         *     responses:
         *       200:
         *         description: The updated cursado
         */
        this.instance.patch("/:id", this.controller.modify);

        /**
         * @swagger
         * /api/cursado/{id}:
         *   delete:
         *     summary: Delete a cursado by ID
         *     responses:
         *       204:
         *         description: No content
         */
        this.instance.delete("/:id", this.controller.delete_);
    }
}
