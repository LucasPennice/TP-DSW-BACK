import express, { Router } from "express";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { ReviewController } from "./review.controller";

export class ReviewRouter {
    public instance: Router;
    private controller: ReviewController;

    constructor(em: MongoEntityManager<MongoDriver>) {
        this.instance = express.Router();
        this.controller = new ReviewController(em);

        this.instance.get("/", this.controller.findAll);

        this.instance.get("/conBorrado", this.controller.findAllConBorrado);

        this.instance.get("/:id", this.controller.findOne);

        this.instance.post("/", this.controller.add);

        this.instance.patch("/:id", this.controller.modify);

        this.instance.delete("/:id", this.controller.delete_);
    }
}
