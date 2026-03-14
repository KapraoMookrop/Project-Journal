import multer from "multer";
import fs from "fs";
import path from "path";

const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join("uploads", "profiles");
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        const userId = req.body.userId;
        cb(null, `user_${userId}${path.extname(file.originalname)}`);
    }
});

export const uploadProfile = multer({ storage: profileStorage });