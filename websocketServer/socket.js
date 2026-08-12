import { Server } from "socket.io";
import messageModel from "../models/message.model.js";

let io;

export default function InitSocket(server) {
    const normalizeOrigin = (value = "") => value.trim().replace(/\/$/, "");
    const allowedOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",").map((origin) => normalizeOrigin(origin)).filter(Boolean)
        : [];

    io = new Server(server, {
        cors: {
            origin: true,
            credentials: true,
        }
    });

    const onlineUsers = new Map(); // userId -> socketId

    io.on("connection", (socket) => {
        console.log(socket.id + " socket connected");

        // user register online status
        socket.on("join", (userId) => {
            if (userId) {
                socket.join(userId);
                onlineUsers.set(userId, socket.id);
                io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
            }
        });

        // join specific chat room
        socket.on("chatroom", (chatId) => {
            if (chatId) {
                socket.join(chatId);
            }
        });

        // typing indicator
        socket.on("typing", ({ chatId, userId, userName }) => {
            if (chatId) {
                socket.to(chatId).emit("typing", { chatId, userId, userName });
            }
        });

        socket.on("stopTyping", ({ chatId, userId }) => {
            if (chatId) {
                socket.to(chatId).emit("stopTyping", { chatId, userId });
            }
        });

        socket.on("messageDelivered", async ({ messageId, userId, chatId }) => {
            if (messageId && userId) {
                await messageModel.findByIdAndUpdate(messageId, {
                    delivered: true,
                    $addToSet: { seen: userId },
                });
                if (chatId) {
                    socket.to(chatId).emit("delivered", { messageId, userId, chatId, message: "delivered" });
                }
            }
        });

        socket.on("disconnect", (reason) => {
            console.log(socket.id + " disconnected: " + reason);
            for (let [userId, sockId] of onlineUsers.entries()) {
                if (sockId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
            io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
        });
    });

    return io;
};


export const getIo = () => io;