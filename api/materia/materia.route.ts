import express, { Router } from "express";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { MateriaController } from "./materia.controller";
import { AuthRoute } from "..";

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
        this.instance.get("/", this.controller.findAll);

        /**
         * @swagger
         * /api/materia/conBorrado:
         *   get:
         *     summary: Retrieve a list of materias including deleted ones
         *     responses:
         *       200:
         *         description: A list of materias including deleted ones
         */
        this.instance.get("/conBorrado", AuthRoute.ensureAdmin, this.controller.findAllConBorrado);

        /**
         * @swagger
         * /api/materia/porAno/{id}:
         *   get:
         *     summary: Retrieve a list of materias by year
         *     responses:
         *       200:
         *         description: A list of materias by year
         */
        this.instance.get("/porAno/:id", this.controller.findMateriasPorAno);

        /**
         * @swagger
         * /api/materia/{id}:
         *   get:
         *     summary: Retrieve a single materia by ID
         *     responses:
         *       200:
         *         description: A single materia
         */
        this.instance.get("/:id", this.controller.findOne);

        /**
         * @swagger
         * /api/materia:
         *   post:
         *     summary: Create a new materia
         *     responses:
         *       201:
         *         description: The created materia
         */
        this.instance.post("/", AuthRoute.ensureAdmin, this.controller.add);

        /**
         * @swagger
         * /api/materia/{id}:
         *   patch:
         *     summary: Update a materia by ID
         *     responses:
         *       200:
         *         description: The updated materia
         */
        this.instance.patch("/:id", AuthRoute.ensureAdmin, this.controller.modify);

        /**
         * @swagger
         * /api/materia/{id}:
         *   delete:
         *     summary: Delete a materia by ID
         *     responses:
         *       204:
         *         description: No content
         */
        this.instance.delete("/:id", AuthRoute.ensureAdmin, this.controller.delete_);
    }
}
