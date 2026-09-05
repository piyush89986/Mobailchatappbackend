import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        type: {
            type: String,
            enum: ["like", "comment", "follow", "message"],
            required: true,
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: "posts",
        },
        text: {
            type: String,
            default: "",
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

const NotificationModel = model("notifications", notificationSchema);

export default NotificationModel;
