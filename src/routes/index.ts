import { Router } from "express";
import user from "./user";
import post from "./post";
import comment from "./comment";

const router = Router(); 
router.use(user);
router.use(post);
router.use(comment);

export default router;
