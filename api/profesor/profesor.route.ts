import express from "express";
import {
    add,
    delete_,
    findAll,
    findAllConBorrado,
    findOne,
    findPorMateriaYAno,
    findReviews,
    findReviewsPorMateria,
    modify,
} from "./profesor.controller.js";
import { ensureAdmin } from "../index.js";

const profesorRouter = express.Router();

profesorRouter.get("/", findAll);

profesorRouter.get("/conBorrado", ensureAdmin, findAllConBorrado);

profesorRouter.get("/:id/reviews", findReviews);

profesorRouter.get("/porMateriaYAno/:ano/:idMateria/:anoCursado", findPorMateriaYAno);

profesorRouter.get("/:id/reviewsDeMateria/:idMateria", findReviewsPorMateria);

profesorRouter.get("/:id", findOne);

profesorRouter.post("/", ensureAdmin, add);

profesorRouter.patch("/:id", ensureAdmin, modify);

profesorRouter.delete("/:id", ensureAdmin, delete_);

export default profesorRouter;
