import express from "express";
import { authMiddlewareOnlyForUser } from "../middleware/auth.middleware.js";
import {
    getFeedPosts,
    createPost,
    toggleLikePost,
    addComment,
    getUserPosts,
    getStories,
    createStory,
    getNotifications,
} from "../contollers/post.controller.js";

const router = express.Router();

router.use("/", authMiddlewareOnlyForUser);

router.get("/", getFeedPosts);
router.post("/", createPost);
router.post("/:postId/like", toggleLikePost);
router.post("/:postId/comment", addComment);
router.get("/user/:userId", getUserPosts);
router.get("/stories", getStories);
router.post("/stories", createStory);
router.get("/notifications", getNotifications);

export default router;
