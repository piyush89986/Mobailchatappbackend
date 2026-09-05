import { Schema, model } from "mongoose";

const commentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const postSchema = new Schema(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        mediaUrl: {
            type: String,
            required: true,
            trim: true,
        },
        mediaType: {
            type: String,
            enum: ["image", "video"],
            default: "image",
        },
        caption: {
            type: String,
            trim: true,
            default: "",
        },
        location: {
            type: String,
            trim: true,
            default: "",
        },
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "users",
            },
        ],
        comments: [commentSchema],
        sharesCount: {
            type: Number,
            default: 0,
        },
        savedBy: [
            {
                type: Schema.Types.ObjectId,
                ref: "users",
            },
        ],
    },
    { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });

const PostModel = model("posts", postSchema);

export default PostModel;
