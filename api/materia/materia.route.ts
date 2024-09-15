import express from "express";
import { findAll, findOne, add, modify, delete_, findAllConBorrado, findMateriasPorAno } from "./materia.controller.js";

const materiaRouter = express.Router();

materiaRouter.get("/", findAll);

materiaRouter.get("/conBorrado", findAllConBorrado);

materiaRouter.get("/porAno/:id", findMateriasPorAno);

materiaRouter.get("/:id", findOne);

materiaRouter.post("/", add);

materiaRouter.patch("/:id", modify);

materiaRouter.delete("/:id", delete_);

export default materiaRouter;
