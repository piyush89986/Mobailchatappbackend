import PostModel from "../models/post.model.js";
import StoryModel from "../models/story.model.js";
import NotificationModel from "../models/notification.model.js";
import ServerResponse from "../response/pattern.js";

// 1. Get Feed Posts
export const getFeedPosts = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
        const skip = (page - 1) * limit;

        const posts = await PostModel.find()
            .populate("author", "_id user_name email avatar bio")
            .populate("comments.user", "_id user_name avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const currentUserId = req.user.id;
        const formattedPosts = posts.map((post) => ({
            ...post,
            likesCount: post.likes ? post.likes.length : 0,
            commentsCount: post.comments ? post.comments.length : 0,
            isLikedByMe: post.likes ? post.likes.some((id) => id.toString() === currentUserId.toString()) : false,
            isSavedByMe: post.savedBy ? post.savedBy.some((id) => id.toString() === currentUserId.toString()) : false,
        }));

        res.json(new ServerResponse(true, formattedPosts, "Feed posts fetched", null));
    } catch (error) {
        res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
};

// 2. Create Post
export const createPost = async (req, res) => {
    const { mediaUrl, mediaType = "image", caption = "", location = "" } = req.body;
    try {
        if (!mediaUrl) {
            return res.status(400).json(new ServerResponse(false, null, "mediaUrl is required", null));
        }

        const newPost = await PostModel.create({
            author: req.user.id,
            mediaUrl,
            mediaType,
            caption: caption.trim(),
            location: location.trim(),
        });

        const fullPost = await PostModel.findById(newPost._id)
            .populate("author", "_id user_name email avatar bio")
            .lean();

        res.status(201).json(new ServerResponse(true, fullPost, "Post created successfully", null));
    } catch (error) {
        res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
};

// 3. Toggle Like on Post
export const toggleLikePost = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;
    try {
        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).json(new ServerResponse(false, null, "Post not found", null));
        }

        const alreadyLikedIndex = post.likes.findIndex((id) => id.toString() === userId.toString());
        let liked = false;

        if (alreadyLikedIndex > -1) {
            post.likes.splice(alreadyLikedIndex, 1);
            liked = false;
        } else {
            post.likes.push(userId);
            liked = true;

            // Create notification if not liking own post
            if (post.author.toString() !== userId.toString()) {
                await NotificationModel.create({
                    recipient: post.author,
                    sender: userId,
                    type: "like",
                    post: post._id,
                    text: "liked your photo.",
                });
            }
        }

        await post.save();

        res.json(
            new ServerResponse(
                true,
                {
                    liked,
                    likesCount: post.likes.length,
                },
                liked ? "Post liked" : "Post unliked",
                null
            )
        );
    } catch (error) {
        res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
};

// 4. Add Comment to Post
export const addComment = async (req, res) => {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    try {
        if (!text || text.trim() === "") {
            return res.status(400).json(new ServerResponse(false, null, "Comment text required", null));
        }

        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).json(new ServerResponse(false, null, "Post not found", null));
        }

        const newComment = {
            user: userId,
            text: text.trim(),
            createdAt: new Date(),
        };

        post.comments.push(newComment);
        await post.save();

        // Notification
        if (post.author.toString() !== userId.toString()) {
            await NotificationModel.create({
                recipient: post.author,
                sender: userId,
                type: "comment",
                post: post._id,
                text: `commented: "${text.trim().slice(0, 40)}"`,
            });
        }

        const updatedPost = await PostModel.findById(postId)
            .populate("comments.user", "_id user_name avatar")
            .lean();

        res.status(201).json(
            new ServerResponse(
                true,
                updatedPost.comments,
                "Comment added successfully",
                null
            )
        );
    } catch (error) {
        res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
};

// 5. Get User Posts for Profile Grid
export const getUserPosts = async (req, res) => {
    const userId = req.params.userId || req.user.id;
    try {
        const posts = await PostModel.find({ author: userId })
            .sort({ createdAt: -1 })
            .lean();

        res.json(new ServerResponse(true, posts, "User posts fetched", null));
    } catch (error) {
        res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
};

// 6. Get Stories
export const getStories = async (req, res) => {
    try {
        const stories = await StoryModel.find()
            .populate("user", "_id user_name avatar")
            .sort({ createdAt: -1 })
            .lean();

        res.json(new ServerResponse(true, stories, "Stories fetched", null));
    } catch (error) {
        res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
};

// 7. Create Story
export const createStory = async (req, res) => {
    const { mediaUrl, mediaType = "image", caption = "" } = req.body;
    try {
        if (!mediaUrl) {
            return res.status(400).json(new ServerResponse(false, null, "mediaUrl is required", null));
        }

        const story = await StoryModel.create({
            user: req.user.id,
            mediaUrl,
            mediaType,
            caption,
        });

        const fullStory = await StoryModel.findById(story._id)
            .populate("user", "_id user_name avatar")
            .lean();

        res.status(201).json(new ServerResponse(true, fullStory, "Story posted", null));
    } catch (error) {
        res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
};

// 8. Get Notifications
export const getNotifications = async (req, res) => {
    try {
        const notifications = await NotificationModel.find({ recipient: req.user.id })
            .populate("sender", "_id user_name avatar")
            .populate("post", "_id mediaUrl")
            .sort({ createdAt: -1 })
            .limit(40)
            .lean();

        res.json(new ServerResponse(true, notifications, "Notifications fetched", null));
    } catch (error) {
        res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
};
