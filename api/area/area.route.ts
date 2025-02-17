import express, { Router } from "express";
import { AreaController } from "./area.controller.js";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";

// areaRouter.get("/", findAll);

// areaRouter.get("/conBorrado", ensureAdmin, findAllConBorrado);

// areaRouter.get("/:id", findOne);

// areaRouter.post("/", ensureAdmin, add);

// areaRouter.patch("/:id", ensureAdmin, modify);

// areaRouter.delete("/:id", ensureAdmin, delete_);

export class AreaRouter {
    public instance: Router;
    private controller: AreaController;

    constructor(em: MongoEntityManager<MongoDriver>) {
        this.instance = express.Router();
        this.controller = new AreaController(em);

        this.instance.get("/", this.controller.findAll);

        this.instance.get("/conBorrado", this.controller.findAllConBorrado);

        this.instance.get("/:id", this.controller.findOne);

        this.instance.post("/", this.controller.add);

        this.instance.patch("/:id", this.controller.modify);

        this.instance.delete("/:id", this.controller.delete_);
    }
}
