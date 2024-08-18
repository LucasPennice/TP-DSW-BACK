import express from "express";
import { findAll, findOne, add, modify, delete_} from "./area.controller.js";

const areaRouter = express.Router();

areaRouter.get("/", findAll)

areaRouter.get("/:id", findOne)

areaRouter.post("/", add)

areaRouter.patch("/:id", modify)

areaRouter.delete("/:id", delete_)


export default areaRouter;