import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the temp folder exists, or create it if it doesn't
const tempDir = path.join(__dirname, './public/temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir); // Store files in the temp folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name (you can also modify it if needed)
  }
});

const upload = multer({ storage: storage });

export { upload };
