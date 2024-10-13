import { Router } from "express";
import { createPost, getUserPosts } from "../controllers/post";

const router = Router();

// // Create a post for a user
// router.post("/users/:id/posts", createPost);

// // Retrieve all posts of a user
// router.get("/users/:id/posts", getUserPosts);

router.route("/users/:id/posts").post(createPost).get(getUserPosts);

export default router;
