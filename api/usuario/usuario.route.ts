import express, { Router } from "express";
import { UsuarioController } from "./usuario.controller";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";

export class UsuarioRouter {
    public instance: Router;
    private controller: UsuarioController;

    constructor(em: MongoEntityManager<MongoDriver>) {
        this.instance = express.Router();
        this.controller = new UsuarioController(em);

        console.log("EM ADENTRO DE USUARIO", em);

        this.instance.get("/", this.controller.findAll);

        this.instance.get("/conBorrado", this.controller.findAllConBorrado);

        this.instance.get("/:id", this.controller.findOne);

        this.instance.post("/", this.controller.add);

        this.instance.patch("/:id", this.controller.modify);

        this.instance.delete("/:id", this.controller.delete_);
    }
}
