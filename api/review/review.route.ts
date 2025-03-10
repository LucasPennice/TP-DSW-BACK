import express, { Router } from "express";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { ReviewController } from "./review.controller";
import { AuthRoute } from "..";
import { Review } from "./review.entity";
import { UsuarioController } from "../usuario/usuario.controller";
import { CursadoController } from "../cursado/cursado.controller";
import { Cursado } from "../cursado/cursado.entity";
import { ExpressResponse_Migration } from "../shared/types";

export class ReviewRouter {
    public instance: Router;
    private controller: ReviewController;
    private usuarioController: UsuarioController;
    private cursadoController: CursadoController;

    constructor(em: MongoEntityManager<MongoDriver>) {
        this.instance = express.Router();
        this.controller = new ReviewController(em);
        this.usuarioController = new UsuarioController(em);
        this.cursadoController = new CursadoController(em);

        /**
         * @swagger
         * /api/review:
         *   get:
         *     summary: Retrieve all reviews
         *     responses:
         *       200:
         *         description: A list of reviews
         */
        this.instance.get("/", async (req, res) => {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;
            const result = await this.controller.findAll(limit, offset);

            if (!result.success) return res.status(500).json(result);

            res.status(200).json(result);
        });

        /**
         * @swagger
         * /api/review/conBorrado:
         *   get:
         *     summary: Retrieve all reviews including deleted ones
         *     responses:
         *       200:
         *         description: A list of reviews including deleted ones
         */
        this.instance.get("/conBorrado", AuthRoute.ensureAdminMiddleware, async (req, res) => {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const result = await this.controller.findAllConBorrado();
            // const result = await this.controller.findAllConBorrado(limit, offset);

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
        this.instance.post("/", async (req, res) => {
            const profesorId = req.body.profesorId;
            const materiaId = req.body.materiaId;
            const anoCursado = parseInt(req.body.anoCursado) as number;
            const anio = parseInt(req.body.anio) as number;
            const userId = req.body.usuarioId as string;

            if (!profesorId || !materiaId || !anoCursado || !anio)
                return res.status(400).send({ success: false, message: "profesorId,materiaId,anoCursado,anio,usuarioId requerido" });

            const parseResult = Review.parseSchema(req.body);

            if (!parseResult.success) return res.status(500).json(parseResult);

            const result = await this.controller.add(parseResult.data!, profesorId, materiaId, anoCursado, anio, userId);

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
            const findUsuarioReq = await this.usuarioController.findOne(req.params.id);

            if (!findUsuarioReq.success) return res.status(500).json(findUsuarioReq);

            const findCursadoReq = await this.cursadoController.findOne(req.params.id);

            if (!findCursadoReq.success) return res.status(500).json(findCursadoReq);

            const parseResult = Review.parseSchema(req.body);

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
