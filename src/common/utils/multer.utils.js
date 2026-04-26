import multer, { diskStorage } from "multer";
import fs from "node:fs";
import { BadRequestException } from "./error.utils.js";
export const fileUpload = () => {
  return multer({
    fileFilter: (req, file, cb) => {
        // allow only jpeg and png images
      if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png"
      ) {
        cb(null, true);
      } else {
        cb(new BadRequestException("Invalid file type"), false);
      }
    },
limits: {
        fileSize: 1024 * 1024 * 5, // 5 MB
      },
    storage: diskStorage({
      destination: (req, file, cb) => {
        const folder = req.user ? `uploads/${req.user._id}` : `uploads/${req.params.receiverId}/messages`;
        // create folder with user id to save his images
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder , { recursive: true });
        }
        cb(null, folder);
      }, // string or function >> "uploads" >> 
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${Math.random()}-${file.originalname}`)
      }, // function
    }), // result from execution of [diskStorage , memoryStorage],
  });
};