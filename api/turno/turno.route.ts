import express from "express";
import { findAll, findOne, add, modify, delete_} from "./turno.controller.js";

const turnoRouter = express.Router();

turnoRouter.get("/", findAll)

turnoRouter.get("/:id", findOne)

turnoRouter.post("/", add)

turnoRouter.patch("/:id", modify)

turnoRouter.delete("/:id", delete_)


export default turnoRouter;