import express from "express";
import { findAll, findOne, add, modify, delete_, findAllConBorrado } from "./cursado.controller.js";

const cursadoRouter = express.Router();

cursadoRouter.get("/", findAll);

cursadoRouter.get("/conBorrado", findAllConBorrado);

cursadoRouter.get("/:id", findOne);

cursadoRouter.post("/", add);

cursadoRouter.patch("/:id", modify);

cursadoRouter.delete("/:id", delete_);

export default cursadoRouter;
