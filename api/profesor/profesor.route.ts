import express, { NextFunction, Request, Response } from "express";
import {findAll, findOne, add, modify, delete_} from "./profesor.controller.js"

const profesorRouter = express.Router();

profesorRouter.get("/", findAll)

profesorRouter.get("/:id", findOne)

profesorRouter.post("/", add)

profesorRouter.patch("/:id", modify)

profesorRouter.delete("/:id", delete_)


export default profesorRouter;