import { Router } from "express";
import { addCommentToPost } from "../controllers/comment";

const router = Router();

router.route("posts/:postId/comments").post(addCommentToPost);

export default router;