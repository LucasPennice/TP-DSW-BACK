import express from "express";
import { findAll, findOne, add, modify, delete_, findAllConBorrado, findMateriasPorAno } from "./materia.controller.js";
import { ensureAdmin } from "../index.js";

const materiaRouter = express.Router();

materiaRouter.get("/", findAll);

materiaRouter.get("/conBorrado", ensureAdmin, findAllConBorrado);

materiaRouter.get("/porAno/:id", findMateriasPorAno);

materiaRouter.get("/:id", findOne);

materiaRouter.post("/", ensureAdmin, add);

materiaRouter.patch("/:id", ensureAdmin, modify);

materiaRouter.delete("/:id", ensureAdmin, delete_);

export default materiaRouter;
