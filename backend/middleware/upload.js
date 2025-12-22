import multer from 'multer';
import path from 'path';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images and zip files
const fileFilter = (req, file, cb) => {
    // Allowed extensions
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedZipTypes = /zip/;

    const extname = path.extname(file.originalname).toLowerCase();

    // Check if it's an image
    if (file.fieldname === 'screenshots' || file.fieldname === 'avatar') {
        const isImage = allowedImageTypes.test(extname.substring(1));
        if (isImage) {
            return cb(null, true);
        } else {
            return cb(new Error('Only image files are allowed for screenshots/avatar'), false);
        }
    }

    // Check if it's a zip file
    if (file.fieldname === 'zipFile') {
        const isZip = allowedZipTypes.test(extname.substring(1));
        if (isZip) {
            return cb(null, true);
        } else {
            return cb(new Error('Only ZIP files are allowed'), false);
        }
    }

    cb(null, true);
};

// Multer upload configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit for ZIP files
    },
});

export default upload;
