import multer from "multer";
import fs from "fs";

fs.mkdirSync("uploads/images", { recursive: true });
fs.mkdirSync("uploads/temp", { recursive: true });
fs.mkdirSync("uploads/posts", { recursive: true });
fs.mkdirSync("uploads/stories", { recursive: true });

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "avatar") {
            cb(null, "uploads/images");
        } else {
            cb(null, "uploads/temp/")
        }
    },
    filename: (req, file, cb) => {
        if (file.fieldname === "avatar") {
            cb(null, Date.now() + "_" + (req.userData?.user_name || "user") + "." + file.mimetype.split("/")[1])
        } else {
            cb(null, file.originalname)
        }
    }
});

const postStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/posts");
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop() || 'jpg';
        cb(null, `post_${Date.now()}_${Math.round(Math.random() * 1e6)}.${ext}`);
    }
});

const mediaFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image and video files are supported"));
    }
};

export const ImageUpload = multer({ storage: imageStorage, limits: 1024 * 1024 * 10 });
export const PostMediaUpload = multer({ storage: postStorage, fileFilter: mediaFileFilter, limits: 1024 * 1024 * 50 });