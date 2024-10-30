import express from "express";
import { ensureAdmin } from "../index.js";
import { add, delete_, findAll, findAllConBorrado, findOne, modify } from "./area.controller.js";

const areaRouter = express.Router();

// areaRouter.get("/", findAll);

// areaRouter.get("/conBorrado", ensureAdmin, findAllConBorrado);

// areaRouter.get("/:id", findOne);

// areaRouter.post("/", ensureAdmin, add);

// areaRouter.patch("/:id", ensureAdmin, modify);

// areaRouter.delete("/:id", ensureAdmin, delete_);

areaRouter.get("/", findAll);

areaRouter.get("/conBorrado", findAllConBorrado);

areaRouter.get("/:id", findOne);

areaRouter.post("/", add);

areaRouter.patch("/:id", modify);

areaRouter.delete("/:id", delete_);

export default areaRouter;
