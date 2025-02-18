import express, { Router } from "express";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { ReviewController } from "./review.controller";
import { AuthRoute } from "..";

export class ReviewRouter {
    public instance: Router;
    private controller: ReviewController;

    constructor(em: MongoEntityManager<MongoDriver>) {
        this.instance = express.Router();
        this.controller = new ReviewController(em);

        /**
         * @swagger
         * /api/review:
         *   get:
         *     summary: Retrieve all reviews
         *     responses:
         *       200:
         *         description: A list of reviews
         */
        this.instance.get("/", this.controller.findAll);

        /**
         * @swagger
         * /api/review/conBorrado:
         *   get:
         *     summary: Retrieve all reviews including deleted ones
         *     responses:
         *       200:
         *         description: A list of reviews including deleted ones
         */
        this.instance.get("/conBorrado", AuthRoute.ensureAdmin, this.controller.findAllConBorrado);

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
        this.instance.patch("/:id", AuthRoute.ensureAdmin, this.controller.modify);

        /**
         * @swagger
         * /api/review/{id}:
         *   delete:
         *     summary: Delete a review by ID
         *     responses:
         *       204:
         *         description: No content
         */
        this.instance.delete("/:id", AuthRoute.ensureAdmin, this.controller.delete_);
    }
}
