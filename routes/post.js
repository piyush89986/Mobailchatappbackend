import express from "express";
import { authMiddlewareOnlyForUser } from "../middleware/auth.middleware.js";
import { PostMediaUpload } from "../config/multer.config.js";
import {
    getFeedPosts,
    createPost,
    toggleLikePost,
    addComment,
    getUserPosts,
    getStories,
    createStory,
    getNotifications,
    uploadPostMedia,
} from "../contollers/post.controller.js";

const router = express.Router();

router.use("/", authMiddlewareOnlyForUser);

router.post("/upload", PostMediaUpload.single("media"), uploadPostMedia);
router.get("/", getFeedPosts);
router.post("/", PostMediaUpload.single("media"), createPost);
router.post("/:postId/like", toggleLikePost);
router.post("/:postId/comment", addComment);
router.get("/user/:userId", getUserPosts);
router.get("/stories", getStories);
router.post("/stories", PostMediaUpload.single("media"), createStory);
router.get("/notifications", getNotifications);

export default router;
