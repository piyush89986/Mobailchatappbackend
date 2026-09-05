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
            cb(null, "uploads/temp/");
        }
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype ? (file.mimetype.split("/")[1] || 'jpg') : 'jpg';
        cb(null, `avatar_${Date.now()}_${Math.round(Math.random() * 1e6)}.${ext}`);
    }
});

const postStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/posts");
    },
    filename: (req, file, cb) => {
        let ext = 'jpg';
        if (file.mimetype && file.mimetype.startsWith('video/')) {
            ext = file.mimetype.split('/')[1] || 'mp4';
        } else if (file.mimetype && file.mimetype.startsWith('image/')) {
            ext = file.mimetype.split('/')[1] || 'jpg';
        } else if (file.originalname && file.originalname.includes('.')) {
            ext = file.originalname.split('.').pop();
        }
        cb(null, `post_${Date.now()}_${Math.round(Math.random() * 1e6)}.${ext}`);
    }
});

const mediaFileFilter = (req, file, cb) => {
    if (file.mimetype && (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/"))) {
        cb(null, true);
    } else {
        cb(new Error("Only image and video files are supported"));
    }
};

export const ImageUpload = multer({ 
    storage: imageStorage, 
    limits: { fileSize: 25 * 1024 * 1024 } 
});

export const PostMediaUpload = multer({ 
    storage: postStorage, 
    fileFilter: mediaFileFilter, 
    limits: { fileSize: 100 * 1024 * 1024 } 
});