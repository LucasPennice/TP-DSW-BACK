import express from "express";
import { add, delete_, findAll, findAllConBorrado, findOne, modify } from "./review.controller.js";
import { ensureAuthenticated, ensureAdmin } from "../index.js";

const reviewRouter = express.Router();

// reviewRouter.get("/", findAll);

// reviewRouter.get("/conBorrado", ensureAdmin, findAllConBorrado);

// reviewRouter.get("/:id", findOne);

// reviewRouter.post("/", ensureAuthenticated, add);

// reviewRouter.patch("/:id", ensureAdmin, modify);

// reviewRouter.delete("/:id", ensureAdmin, delete_);

reviewRouter.get("/", findAll);

reviewRouter.get("/conBorrado", findAllConBorrado);

reviewRouter.get("/:id", findOne);

reviewRouter.post("/", add);

reviewRouter.patch("/:id", modify);

reviewRouter.delete("/:id", delete_);

export default reviewRouter;
