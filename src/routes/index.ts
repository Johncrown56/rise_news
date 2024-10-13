import { Router } from "express";
import user from "./user";
import post from "./post";
import comment from "./comment";
import health from "./health"

const router = Router(); 
router.use(user);
router.use(post);
router.use(comment);
router.use(health);

export default router;
