import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    const today = new Date().toISOString().split("T")[0]; 
    const uploadPath = path.join("uploads", "documents", today as string);

    // ถ้าโฟลเดอร์ไม่มีให้สร้าง
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

export const uploadJournal = multer({ storage });