import express, { Router } from "express";
import { ProfesorController } from "./profesor.controller";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { AuthRoute } from "..";

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
        this.instance.get("/", this.controller.findAll);

        /**
         * @swagger
         * /api/profesor/conBorrado:
         *   get:
         *     summary: Retrieve all profesors including deleted ones
         *     responses:
         *       200:
         *         description: A list of profesors including deleted ones
         */
        this.instance.get("/conBorrado", AuthRoute.ensureAdmin, this.controller.findAllConBorrado);
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
        this.instance.get("/:id/reviews", this.controller.findReviews);

        /**
         * @swagger
         * /api/profesor/porMateriaYAno/{ano}/{idMateria}/{anoCursado}:
         *   get:
         *     summary: Retrieve profesors by subject and year of study
         *     responses:
         *       200:
         *         description: A list of profesors by subject and year of study
         */
        this.instance.get("/porMateriaYAno/:ano/:idMateria/:anoCursado", this.controller.findPorMateriaYAnoYAnoCursado);

        /**
         * @swagger
         * /api/profesor/porMateriaYAno/{ano}/{idMateria}:
         *   get:
         *     summary: Retrieve profesors by subject and year
         *     responses:
         *       200:
         *         description: A list of profesors by subject and year
         */
        this.instance.get("/porMateriaYAno/:ano/:idMateria", this.controller.findPorMateriaYAno);

        /**
         * @swagger
         * /api/profesor/{id}/reviewsDeMateria/{idMateria}:
         *   get:
         *     summary: Retrieve reviews for a specific profesor and subject
         *     responses:
         *       200:
         *         description: A list of reviews for the profesor and subject
         */
        this.instance.get("/:id/reviewsDeMateria/:idMateria", this.controller.findReviewsPorMateria);

        /**
         * @swagger
         * /api/profesor/{id}:
         *   get:
         *     summary: Retrieve a single profesor by ID
         *     responses:
         *       200:
         *         description: A single profesor
         */
        this.instance.get("/:id", this.controller.findOne);

        /**
         * @swagger
         * /api/profesor:
         *   post:
         *     summary: Create a new profesor
         *     responses:
         *       201:
         *         description: The created profesor
         */
        this.instance.post("/", AuthRoute.ensureAdmin, this.controller.add);

        /**
         * @swagger
         * /api/profesor/{id}:
         *   patch:
         *     summary: Update a profesor by ID
         *     responses:
         *       200:
         *         description: The updated profesor
         */
        this.instance.patch("/:id", AuthRoute.ensureAdmin, this.controller.modify);

        /**
         * @swagger
         * /api/profesor/{id}:
         *   delete:
         *     summary: Delete a profesor by ID
         *     responses:
         *       204:
         *         description: No content
         */
        this.instance.delete("/:id", AuthRoute.ensureAdmin, this.controller.delete_);
    }
}
