import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import { generateToken } from '../config/jwt.config.js';
import ServerResponse from '../response/pattern.js';
import fs from "fs";
import transpoter from '../config/mail.config.js';
import { config } from 'dotenv';
config();

export async function loginUser(req, res) {
    try {
        const { login_user, password } = req.body;

        if (!login_user || !password) {
            return res.status(400).json(new ServerResponse(false, null, "Username/Email/Phone and Password are required", null));
        }

        const cleanLogin = login_user.trim();
        const searchRegex = new RegExp(`^${cleanLogin}$`, "i");

        let user = await User.findOne({
            $or: [
                { email: searchRegex },
                { phone: cleanLogin },
                { user_name: searchRegex }
            ]
        });

        if (!user) {
            return res.status(404).json(new ServerResponse(false, null, "Invalid credentials. User not found.", null));
        }

        if (!user.isActive || user.isDeleted) {
            return res.status(401).json(new ServerResponse(false, null, "Account is disabled or deleted. Please contact support.", null));
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json(new ServerResponse(false, null, "Invalid password", null));
        }

        let userData = user.toObject();
        delete userData.password;
        delete userData.__v;

        let token = generateToken({ id: userData._id, email: userData.email, role: userData.role });
        userData.token = token;

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('token', token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        return res.status(200).json(new ServerResponse(true, userData, "User logged in successfully", null));
    } catch (error) {
        return res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
}

export async function getUser(req, res) {
    try {
        let users = await User.findById(req.user.id).select("-password -__v");
        if (!users) {
            return res.status(404).json(new ServerResponse(false, null, "User not found", null));
        }
        return res.status(200).json(new ServerResponse(true, users, "Successfully fetched user", null));
    } catch (error) {
        return res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
}

export async function addUser(req, res) {
    try {
        const { user_name, email, phone, password } = req.body;

        const cleanEmail = email ? email.trim().toLowerCase() : "";
        const cleanPhone = phone ? phone.trim() : "";

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: cleanEmail },
                ...(cleanPhone ? [{ phone: cleanPhone }] : [])
            ]
        });

        if (existingUser) {
            const field = existingUser.email === cleanEmail ? "Email" : "Phone number";
            return res.status(400).json(new ServerResponse(false, null, `${field} is already registered`, null));
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            user_name: user_name.trim(),
            email: cleanEmail,
            phone: cleanPhone,
            password: hashedPassword,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user_name.trim())}`
        });

        // Fail-safe non-blocking email notification
        transpoter.sendMail({
            from: process.env.EMAIL || "noreply@chatapp.com",
            to: cleanEmail,
            subject: "Welcome to ChatSphere!",
            html: `<h2>Welcome, ${user_name}!</h2><p>Your ChatSphere account has been created successfully.</p>`
        }).catch((mailErr) => {
            console.log("Welcome Mail Notice (non-fatal):", mailErr.message);
        });

        let createdUserData = newUser.toObject();
        delete createdUserData.password;
        delete createdUserData.__v;

        return res.status(201).json(new ServerResponse(true, createdUserData, "User registered successfully", null));
    } catch (error) {
        return res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
}

export async function updateUser(req, res) {
    const { user_name, email, gender, bio, address } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { user_name, email, gender, bio, address },
            { new: true }
        ).select("-password -__v");

        if (!user) {
            return res.status(404).json(new ServerResponse(false, null, "User not found"));
        }

        return res.status(200).json(new ServerResponse(true, user, "Details updated successfully", null));
    } catch (error) {
        return res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
}

export async function deleteUser(req, res) {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.user.id, isDeleted: false, isActive: true },
            { isDeleted: true, isActive: false },
            { new: true }
        );
        if (!user) {
            return res.status(404).json(new ServerResponse(false, null, "Account not found"));
        }

        return res.status(200).json(new ServerResponse(true, null, "Account deleted successfully", null));
    } catch (error) {
        return res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
}

export async function uploadDp(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json(new ServerResponse(false, null, "No image uploaded", null));
        }

        const host = req.get("host") || "localhost:4000";
        const protocol = req.protocol || "http";
        const relativePath = req.file.path.replace(/\\/g, "/");
        let imageUrl = `${protocol}://${host}/${relativePath}`;

        const user = await User.findByIdAndUpdate(req.user.id, { avatar: imageUrl }, { new: true }).select("-password -__v");

        if (!user) {
            return res.status(404).json(new ServerResponse(false, null, "User not found"));
        }

        if (req.userData?.avatar) {
            let fileIndex = req.userData.avatar.indexOf("uploads");
            if (fileIndex >= 0) {
                await fs.promises.rm(req.userData.avatar.slice(fileIndex), { recursive: true, force: true }).catch(() => {});
            }
        }

        return res.status(200).json(new ServerResponse(true, user, "Profile avatar updated successfully", null));
    } catch (error) {
        return res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
}

export async function searchUsers(req, res) {
    const { q } = req.query;

    try {
        if (!q || q.trim() === "") {
            return res.status(400).json(new ServerResponse(false, null, "Search query is required", null));
        }

        const cleanQ = q.trim();
        let regex = new RegExp(cleanQ, "i");

        const users = await User.find({
            isDeleted: false,
            _id: { $ne: req.user.id },
            $or: [
                { user_name: { $regex: regex } },
                { email: { $regex: regex } },
                { phone: { $regex: regex } }
            ]
        })
            .select("user_name email phone avatar bio")
            .limit(20)
            .lean();

        return res.status(200).json(new ServerResponse(true, users, "Users found", null));
    } catch (error) {
        return res.status(500).json(new ServerResponse(false, null, error.message, error));
    }
}


