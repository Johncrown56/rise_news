import { Router, Request, Response, NextFunction } from "express";

const router = Router();

router.get("/health", (req: Request, res: Response, _next: NextFunction) => {
  res
    .status(200)
    .header("Content-Type", "text/html")
    .send(`<h1>Asharami's APIs  are up and running</h1>`);
});

export default router;
