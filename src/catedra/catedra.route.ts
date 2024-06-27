import express, { NextFunction, Request, Response } from "express";
import { Catedra } from "./catedra.entity.js";
import { orm } from "../orm.js";
import { CatedraRepository } from "./catedra.repository.js";
import { findAll, findOne, add, modify, delete_} from "./catedra.controler.js";



const catedraRouter = express.Router();
const repository = new CatedraRepository()

catedraRouter.get("/", findAll)

catedraRouter.get("/:id", findOne)

catedraRouter.post("/", add)

catedraRouter.patch("/:id", modify)

catedraRouter.delete("/:id", delete_)


export default catedraRouter;