import { Schema, model } from "mongoose";

const storySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    mediaUrl: {
        type: String,
        required: true,
    },
    mediaType: {
        type: String,
        enum: ["image", "video"],
        default: "image",
    },
    caption: {
        type: String,
        default: "",
    },
    views: [
        {
            type: Schema.Types.ObjectId,
            ref: "users",
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400, // Auto-delete after 24 hours
    },
});

const StoryModel = model("stories", storySchema);

export default StoryModel;
