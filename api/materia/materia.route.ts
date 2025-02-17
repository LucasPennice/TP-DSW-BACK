import express, { Router } from "express";

import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { MateriaController } from "./materia.controller";

// materiaRouter.get("/", findAll);

// materiaRouter.get("/conBorrado", ensureAdmin, findAllConBorrado);

// materiaRouter.get("/porAno/:id", findMateriasPorAno);

// materiaRouter.get("/:id", findOne);

// materiaRouter.post("/", ensureAdmin, add);

// materiaRouter.patch("/:id", ensureAdmin, modify);

// materiaRouter.delete("/:id", ensureAdmin, delete_);

export class MateriaRouter {
    public instance: Router;
    private controller: MateriaController;

    constructor(em: MongoEntityManager<MongoDriver>) {
        this.instance = express.Router();
        this.controller = new MateriaController(em);

        this.instance.get("/", this.controller.findAll);

        this.instance.get("/conBorrado", this.controller.findAllConBorrado);

        this.instance.get("/porAno/:id", this.controller.findMateriasPorAno);

        this.instance.get("/:id", this.controller.findOne);

        this.instance.post("/", this.controller.add);

        this.instance.patch("/:id", this.controller.modify);

        this.instance.delete("/:id", this.controller.delete_);
    }
}
