import MessageModel from "../models/message.model.js";
import chatModel from "../models/chat.model.js";
import userModel from "../models/user.model.js"
import ServerResponse from "../response/pattern.js";
import { getIo } from "../websocketServer/socket.js";

// one and one chat option created-
export const accessChat = async (req, res) => {
    const { receiverId } = req.body;
    const myId = req.user.id;
    try {
        if (!receiverId) {
            return res.status(400).json(new ServerResponse(false, null, "receiverId required", null));
        }

        let receiver = await userModel.findById(receiverId).select("user_name _id phone email avatar bio").lean();
        if (!receiver) {
            return res.status(404).json(new ServerResponse(false, null, "Recipient user not found", null));
        }

        let chat = await chatModel.findOne({
            isGroupChat: false,
            members: { $all: [myId, receiverId], $size: 2 },
        })
            .populate("members", "_id user_name email phone avatar bio")
            .populate("lastMessage")
            .lean();

        if (chat) {
            chat.reciver = receiver;
            return res.status(200).json(new ServerResponse(true, chat, "Chat retrieved", null));
        }

        let newChat = await chatModel.create({
            members: [myId, receiverId],
        });

        let fullChat = await chatModel.findById(newChat._id)
            .populate("members", "_id user_name email phone avatar bio")
            .lean();

        fullChat.reciver = receiver;
        res.status(201).json(new ServerResponse(true, fullChat, "Chat created", null));

    } catch (error) {
        res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
};

/**
 * Create Group Chat
 */
export const createGroupChat = async (req, res) => {
    const { members, groupName } = req.body;

    if (!members || !Array.isArray(members) || members.length < 1) {
        return res.status(400).json(new ServerResponse(false, null, "At least 1 other user required to create a group", null));
    }

    try {
        const uniqueMembers = [...new Set([...members, req.user.id])];
        const groupChat = await chatModel.create({
            members: uniqueMembers,
            isGroupChat: true,
            groupName: groupName || "New Group",
            groupAdmin: req.user.id,
            groupIcon: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(groupName || 'group')}`
        });

        const fullGroupChat = await chatModel.findById(groupChat._id)
            .populate("members", "_id user_name email phone avatar bio")
            .lean();

        res.status(201).json(new ServerResponse(true, fullGroupChat, "Group chat created successfully", null));

    } catch (error) {
        res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
};

/**
 * Get My Chats
 */
export const getMyChats = async (req, res) => {
    try {
        let chats = await chatModel.find({
            members: req.user.id,
        })
            .populate("members", "_id user_name email phone avatar bio")
            .populate({
                path: "lastMessage",
                select: "sender message createdAt delivered seen",
            })
            .sort({ updatedAt: -1 })
            .lean();

        res.json(new ServerResponse(true, chats, "Chats fetched successfully", null));
    } catch (error) {
        res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
};

/**
 * Send Message
 */
export const sendMessage = async (req, res) => {
    const { chatId, message } = req.body;

    try {
        if (!chatId || !message || message.trim() === "") {
            return res.status(400).json(new ServerResponse(false, null, "chatId and message are required", null));
        }

        let getMessage = await MessageModel.create({
            chatId,
            sender: req.user.id,
            message: message.trim(),
        });

        await chatModel.findByIdAndUpdate(chatId, {
            lastMessage: getMessage._id,
        });

        getMessage = getMessage.toObject();
        getMessage.sender = req.userData || { _id: req.user.id };

        let io = getIo();
        if (io) {
            io.to(chatId).emit("newMessage", getMessage);
        }

        res.status(201).json(new ServerResponse(true, getMessage, "Message sent", null));

    } catch (error) {
        res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
};

/**
 * Get Messages of a Chat
 */
export const getMessages = async (req, res) => {
    const { chatId } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;
    try {
        const messages = await MessageModel.find({ chatId })
            .populate("sender", "_id user_name email avatar")
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.json(new ServerResponse(true, messages, "Messages fetched", null));
    } catch (error) {
        res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
};

