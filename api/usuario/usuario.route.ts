import express from "express";
import { findAll, findOne, add, modify, delete_, findAllConBorrado } from "./usuario.controller.js";

const usuarioRouter = express.Router();

usuarioRouter.get("/", findAll);

usuarioRouter.get("/conBorrado", findAllConBorrado);

usuarioRouter.get("/:id", findOne);

usuarioRouter.post("/", add);

usuarioRouter.patch("/:id", modify);

usuarioRouter.delete("/:id", delete_);

export default usuarioRouter;
