import multer from "multer";
import path from "path";

const upload = multer({
  dest: "uploads/",
  limits: { fieldSize: 500 * 1024 * 1024 }, // 50 MB limit
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (_req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);

    if (
      ext !== ".jpg" &&
      ext !== ".jpeg" &&
      ext !== ".webp" &&
      ext !== ".png" &&
      ext !== ".mp4" &&
      ext !== ".mkv"
    ) {
      cb(new Error(`Unsupported file type !! ${ext}`), false);
    } else {
      cb(null, true);
    }
  },
});

export { upload };
