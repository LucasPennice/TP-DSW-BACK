import express from "express";
import { add, delete_, findAll, findAllConBorrado, findOne, findReviews, modify } from "./profesor.controller.js";

const profesorRouter = express.Router();

profesorRouter.get("/", findAll);

profesorRouter.get("/conBorrado", findAllConBorrado);

profesorRouter.get("/:id/reviews", findReviews);

profesorRouter.get("/:id", findOne);

profesorRouter.post("/", add);

profesorRouter.patch("/:id", modify);

profesorRouter.delete("/:id", delete_);

export default profesorRouter;
