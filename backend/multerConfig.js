import multer from "multer";
import path from "path";


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'text/csv') {
        return cb(new Error('Only CSV files are allowed'), false);
    }
    cb(null, true);
},
limits: { fileSize: 1024 * 1024 * 5 },});

export default upload;

