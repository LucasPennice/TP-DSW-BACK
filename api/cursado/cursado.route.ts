import express from "express";
import { ensureAdmin } from "../index.js";
import { add, delete_, findAll, findAllConBorrado, findOne, modify } from "./cursado.controller.js";

const cursadoRouter = express.Router();

// cursadoRouter.get("/", findAll);

// cursadoRouter.get("/conBorrado", ensureAdmin, findAllConBorrado);

// cursadoRouter.get("/:id", findOne);

// cursadoRouter.post("/", ensureAdmin, add);

// cursadoRouter.patch("/:id", ensureAdmin, modify);

// cursadoRouter.delete("/:id", ensureAdmin, delete_);

cursadoRouter.get("/", findAll);

cursadoRouter.get("/conBorrado", findAllConBorrado);

cursadoRouter.get("/:id", findOne);

cursadoRouter.post("/", add);

cursadoRouter.patch("/:id", modify);

cursadoRouter.delete("/:id", delete_);

export default cursadoRouter;
