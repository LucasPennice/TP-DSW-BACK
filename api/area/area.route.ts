import express from "express";
import { findAll, findOne, add, modify, delete_} from "./area.controller.js";

const catedraRouter = express.Router();

catedraRouter.get("/", findAll)

catedraRouter.get("/:id", findOne)

catedraRouter.post("/", add)

catedraRouter.patch("/:id", modify)

catedraRouter.delete("/:id", delete_)


export default catedraRouter;