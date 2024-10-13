import { Router } from "express";
import { addCommentToPost } from "../controllers/comment";
import middleware from "../middleware/auth";
const { protect } = middleware;


const router = Router();

router.route("/posts/:postId/comments").post(protect, addCommentToPost);

export default router;