import express from "express";
import { findAll, findOne, add, modify, delete_} from "./comision.controller.js";

const comisionRouter = express.Router();

comisionRouter.get("/", findAll)

comisionRouter.get("/:id", findOne)

comisionRouter.post("/", add)

comisionRouter.patch("/:id", modify)

comisionRouter.delete("/:id", delete_)


export default comisionRouter;