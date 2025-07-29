const multer = require('multer');
const path = require('path');

// Configure allowed file types
const allowedTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/x-msvideo': 'avi',
  'application/pdf': 'pdf'
};

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos and PDFs are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

module.exports = upload;