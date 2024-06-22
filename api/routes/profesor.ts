import express, { NextFunction, Request, Response } from "express";

const profesorRouter = express.Router();

profesorRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
    res.send("ruta profesor")
});

export default profesorRouter;