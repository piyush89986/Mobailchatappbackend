import { Schema, model } from "mongoose";

const chatSchema = new Schema(
    {
        // chat participants
        members: [
            {
                type: Schema.Types.ObjectId,
                ref: "users",
                required: true,
            },
        ],

        // chat type
        isGroupChat: {
            type: Boolean,
            default: false,
        },

        // group chat name
        groupName: {
            type: String,
            trim: true,
        },

        // group chat name
        groupIcon: {
            type: String,
            trim: true,
        },

        // group admin (only for group)
        groupAdmin: {
            type: Schema.Types.ObjectId,
            ref: "users",
        },

        // last message (for chat list preview)
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: "messages",
        },

        // chat request status (for Instagram style requests)
        status: {
            type: String,
            enum: ["pending", "accepted", "declined"],
            default: "accepted", // group chats & existing default to accepted, 1-on-1 set to pending if new
        },

        // user who initiated the chat request
        requestedBy: {
            type: Schema.Types.ObjectId,
            ref: "users",
        },

        // unread count per user
        unreadCounts: [
            {
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: "users",
                },
                count: {
                    type: Number,
                    default: 0,
                },
            },
        ],
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// Optimize common chat list and membership lookups.
chatSchema.index({ members: 1, updatedAt: -1 });
chatSchema.index({ isGroupChat: 1, updatedAt: -1 });

export default model("chats", chatSchema)