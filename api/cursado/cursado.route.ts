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

        this.instance.get("/", this.controller.findAll);

        this.instance.get("/conBorrado", this.controller.findAllConBorrado);

        this.instance.get("/:id", this.controller.findOne);

        this.instance.post("/", this.controller.add);

        this.instance.patch("/:id", this.controller.modify);

        this.instance.delete("/:id", this.controller.delete_);
    }
}
