import PostModel from "../models/post.model.js";
import UserModel from "../models/user.model.js";
import StoryModel from "../models/story.model.js";
import NotificationModel from "../models/notification.model.js";
import ServerResponse from "../response/pattern.js";
import { uploadToCloudinary } from "../config/cloudinary.config.js";

// In-memory cache for Imgflip Memes to keep performance instant
let cachedMemes = [];
let lastMemeFetchTime = 0;
const MEME_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// In-memory like tracker for virtual meme posts: key is `${userId}_${postId}`
const memeLikesMap = new Map();

// Virtual Creators / Meme pages on FOMO
const MEME_CREATORS = [
    { name: "dank_memer", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=dankmemer", bio: "Chief Meme Officer 😂" },
    { name: "fomo_comedy", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fomocomedy", bio: "Laughing at FOMO daily 🔥" },
    { name: "sarcasm_society", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=sarcasmsociety", bio: "High quality sarcasm only ☕" },
    { name: "daily_laughs", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dailylaughs", bio: "Your daily dose of smiles ✨" },
    { name: "meme_lord_official", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=memelordofficial", bio: "Living rent-free in your feed 🚀" },
    { name: "relatable_af", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=relatableaf", bio: "Too relatable to ignore 💀" }
];

async function fetchImgflipMemes() {
    const now = Date.now();
    if (cachedMemes.length > 0 && now - lastMemeFetchTime < MEME_CACHE_DURATION) {
        return cachedMemes;
    }

    try {
        const response = await fetch("https://api.imgflip.com/get_memes");
        const json = await response.json();
        if (json && json.success && json.data && Array.isArray(json.data.memes)) {
            cachedMemes = json.data.memes;
            lastMemeFetchTime = now;
            return cachedMemes;
        }
    } catch (e) {
        console.error("Imgflip fetch notice (safe fallback):", e.message);
    }
    return cachedMemes;
}

// 1. Get Feed Posts (Combines Real MongoDB Posts + Live Imgflip Memes)
export const getFeedPosts = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
        const skip = (page - 1) * limit;
        const currentUserId = req.user?.id || "guest";

        // 1. Fetch real posts from MongoDB
        const posts = await PostModel.find()
            .populate("author", "_id user_name email avatar bio")
            .populate("comments.user", "_id user_name avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const formattedRealPosts = posts.map((post) => ({
            ...post,
            likesCount: post.likes ? post.likes.length : 0,
            commentsCount: post.comments ? post.comments.length : 0,
            isLikedByMe: post.likes ? post.likes.some((id) => id.toString() === currentUserId.toString()) : false,
            isSavedByMe: post.savedBy ? post.savedBy.some((id) => id.toString() === currentUserId.toString()) : false,
        }));

        // 2. Fetch virtual memes from Imgflip (Zero DB Storage, 100% on-the-fly)
        let memePosts = [];
        try {
            const rawMemes = await fetchImgflipMemes();
            if (rawMemes && rawMemes.length > 0) {
                // Paginate memes so scrolling shows more memes
                const memeSkip = (page - 1) * 15;
                const pageMemes = rawMemes.slice(memeSkip, memeSkip + 15);

                memePosts = pageMemes.map((meme, idx) => {
                    const creator = MEME_CREATORS[(memeSkip + idx) % MEME_CREATORS.length];
                    const memePostId = `meme_${meme.id}`;
                    const isLiked = memeLikesMap.has(`${currentUserId}_${memePostId}`);
                    const baseLikes = ((parseInt(meme.id, 10) || 100) % 200) + 45;

                    return {
                        _id: memePostId,
                        author: {
                            _id: `creator_${creator.name}`,
                            user_name: creator.name,
                            avatar: creator.avatar,
                            bio: creator.bio,
                        },
                        mediaUrl: meme.url,
                        mediaType: "image",
                        isReel: false,
                        caption: meme.name,
                        location: "Meme Central",
                        likes: isLiked ? [currentUserId] : [],
                        likesCount: isLiked ? baseLikes + 1 : baseLikes,
                        comments: [],
                        commentsCount: ((parseInt(meme.id, 10) || 5) % 20) + 2,
                        sharesCount: ((parseInt(meme.id, 10) || 2) % 12) + 1,
                        isLikedByMe: isLiked,
                        isSavedByMe: false,
                        createdAt: new Date(Date.now() - ((memeSkip + idx) * 15 * 60 * 1000)),
                    };
                });
            }
        } catch (mErr) {
            console.error("Meme integration notice (non-fatal):", mErr.message);
        }

        // 3. Merge: Real posts first, followed by fresh memes!
        const allPosts = [...formattedRealPosts, ...memePosts];

        res.json(new ServerResponse(true, allPosts, "Feed posts fetched", null));
    } catch (error) {
        res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
};

// Upload Post Media File (Cloudinary + Local Fallback)
export const uploadPostMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json(new ServerResponse(false, null, "No media file uploaded", null));
        }

        let fileUrl = null;
        let detectedMediaType = req.file.mimetype.startsWith("video/") ? "video" : "image";

        // 1. Try Cloudinary
        const cloudResult = await uploadToCloudinary(req.file.path, "fomo_media");
        if (cloudResult && cloudResult.url) {
            fileUrl = cloudResult.url;
            if (cloudResult.resource_type === "video") detectedMediaType = "video";
        } else {
            // 2. Fallback to local server path
            const host = req.get("host");
            const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
            const normalizedPath = req.file.path.replace(/\\/g, "/");
            fileUrl = `${protocol}://${host}/${normalizedPath}`;
        }

        return res.status(200).json(new ServerResponse(true, {
            url: fileUrl,
            mediaType: detectedMediaType,
        }, "Media uploaded successfully", null));
    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
};

// 2. Create Post / Reel
export const createPost = async (req, res) => {
    let { mediaUrl, mediaType = "image", isReel = false, caption = "", location = "" } = req.body;
    try {
        if (req.file) {
            const cloudResult = await uploadToCloudinary(req.file.path, isReel ? "fomo_reels" : "fomo_posts");
            if (cloudResult && cloudResult.url) {
                mediaUrl = cloudResult.url;
                if (cloudResult.resource_type === "video") mediaType = "video";
            } else {
                const host = req.get("host");
                const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
                mediaUrl = `${protocol}://${host}/${req.file.path.replace(/\\/g, "/")}`;
                if (req.file.mimetype.startsWith("video/")) mediaType = "video";
            }
        }

        if (!mediaUrl) {
            return res.status(400).json(new ServerResponse(false, null, "mediaUrl or media file is required", null));
        }

        const newPost = await PostModel.create({
            author: req.user.id,
            mediaUrl,
            mediaType,
            isReel: Boolean(isReel || mediaType === 'video'),
            caption: (caption || "").trim(),
            location: (location || "").trim(),
        });

        const fullPost = await PostModel.findById(newPost._id)
            .populate("author", "_id user_name email avatar bio")
            .lean();

        res.status(201).json(new ServerResponse(true, fullPost, "Post created successfully", null));
    } catch (error) {
        console.error("Create post error:", error);
        res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
};

// 3. Toggle Like on Post
export const toggleLikePost = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;
    try {
        // Virtual Meme Post like handling (Instant, In-Memory)
        if (postId && postId.startsWith("meme_")) {
            const likeKey = `${userId}_${postId}`;
            const wasLiked = memeLikesMap.has(likeKey);
            if (wasLiked) {
                memeLikesMap.delete(likeKey);
            } else {
                memeLikesMap.set(likeKey, true);
            }
            const baseLikes = 142;
            return res.json(
                new ServerResponse(
                    true,
                    {
                        liked: !wasLiked,
                        likesCount: !wasLiked ? baseLikes + 1 : baseLikes,
                    },
                    !wasLiked ? "Post liked" : "Post unliked",
                    null
                )
            );
        }

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

        // Virtual Meme Post comment handling (Instant)
        if (postId && postId.startsWith("meme_")) {
            const mockComment = {
                _id: `comment_${Date.now()}`,
                user: {
                    _id: userId,
                    user_name: req.user?.user_name || "You",
                    avatar: req.user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
                },
                text: text.trim(),
                createdAt: new Date(),
            };
            return res.status(201).json(
                new ServerResponse(
                    true,
                    [mockComment],
                    "Comment added successfully",
                    null
                )
            );
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
    let { mediaUrl, mediaType = "image", caption = "" } = req.body;
    try {
        if (req.file) {
            const cloudResult = await uploadToCloudinary(req.file.path, "fomo_stories");
            if (cloudResult && cloudResult.url) {
                mediaUrl = cloudResult.url;
                if (cloudResult.resource_type === "video") mediaType = "video";
            } else {
                const host = req.get("host");
                const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
                mediaUrl = `${protocol}://${host}/${req.file.path.replace(/\\/g, "/")}`;
                if (req.file.mimetype.startsWith("video/")) mediaType = "video";
            }
        }

        if (!mediaUrl) {
            return res.status(400).json(new ServerResponse(false, null, "mediaUrl or media file is required", null));
        }

        const story = await StoryModel.create({
            user: req.user.id,
            mediaUrl,
            mediaType,
            caption: (caption || "").trim(),
        });

        const fullStory = await StoryModel.findById(story._id)
            .populate("user", "_id user_name avatar")
            .lean();

        res.status(201).json(new ServerResponse(true, fullStory, "Story posted successfully", null));
    } catch (error) {
        console.error("Create story error:", error);
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
