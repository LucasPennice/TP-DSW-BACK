import express from "express";
import { add, delete_, findAll, findOne, modify } from "./review.controller.js";

const reviewRouter = express.Router();

reviewRouter.get("/", findAll)

reviewRouter.get("/:id", findOne)

reviewRouter.post("/", add)

reviewRouter.patch("/:id", modify)

reviewRouter.delete("/:id", delete_)


export default reviewRouter;