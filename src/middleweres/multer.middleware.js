import multer from 'multer';

// Use memory storage (files stored in memory as Buffer)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB file size limit
});

export { upload };
