import express, { Router } from "express";
import { ProfesorController } from "./profesor.controller";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";

export class ProfesorRouter {
    public instance: Router;
    private controller: ProfesorController;

    constructor(em: MongoEntityManager<MongoDriver>) {
        this.instance = express.Router();
        this.controller = new ProfesorController(em);

        this.instance.get("/", this.controller.findAll);

        // this.instance.get("/conBorrado", ensureAdmin, findAllConBorrado);
        this.instance.get("/conBorrado", this.controller.findAllConBorrado);

        this.instance.get("/:id/reviews", this.controller.findReviews);

        this.instance.get("/porMateriaYAno/:ano/:idMateria/:anoCursado", this.controller.findPorMateriaYAnoYAnoCursado);
        this.instance.get("/porMateriaYAno/:ano/:idMateria", this.controller.findPorMateriaYAno);

        this.instance.get("/:id/reviewsDeMateria/:idMateria", this.controller.findReviewsPorMateria);

        this.instance.get("/:id", this.controller.findOne);

        this.instance.post("/", this.controller.add);

        this.instance.patch("/:id", this.controller.modify);
        // this.instance.patch("/:id", ensureAdmin, modify);

        // this.instance.delete("/:id", ensureAdmin, delete_);
        this.instance.delete("/:id", this.controller.delete_);
    }
}
