const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Storage configuration for ID cards
const idCardStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/id-cards');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'id-card-' + uniqueSuffix + ext);
  }
});

// Storage configuration for reports
const reportStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/reports');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'report-' + uniqueSuffix + ext);
  }
});

// Storage configuration for acceptance letters
const acceptanceLetterStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/acceptance-letters');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'acceptance-letter-' + uniqueSuffix + ext);
  }
});

// Storage configuration for application attachments (CV/Resume)
const applicationAttachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/attachments');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'attachment-' + uniqueSuffix + ext);
  }
});

// Storage configuration for live photos (selfies for verification)
const livePhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/live-photos');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'live-photo-' + uniqueSuffix + ext);
  }
});

// File filter for live photos (images only)
const livePhotoFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('image/');

  if (mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for live photos'));
  }
};

// File filter for ID cards (images and PDFs)
const idCardFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and PDF files are allowed for ID cards'));
  }
};

// File filter for reports (PDFs and DOCX)
const reportFileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype === 'application/pdf' ||
                   file.mimetype === 'application/msword' ||
                   file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed for reports'));
  }
};

// Multer configuration for ID cards
const uploadIdCard = multer({
  storage: idCardStorage,
  fileFilter: idCardFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Multer configuration for reports
const uploadReport = multer({
  storage: reportStorage,
  fileFilter: reportFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Multer configuration for acceptance letters
const uploadAcceptanceLetter = multer({
  storage: acceptanceLetterStorage,
  fileFilter: reportFileFilter, // Same filter as reports (PDF, DOC, DOCX)
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Multer configuration for application attachments
const uploadApplicationAttachment = multer({
  storage: applicationAttachmentStorage,
  fileFilter: reportFileFilter, // Same filter as reports (PDF, DOC, DOCX)
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Multer configuration for live photos
const uploadLivePhoto = multer({
  storage: livePhotoStorage,
  fileFilter: livePhotoFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Combined storage for registration (ID card + Live photo)
const registrationStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    if (file.fieldname === 'idCard') {
      uploadPath = path.join(__dirname, '../uploads/id-cards');
    } else if (file.fieldname === 'livePhoto') {
      uploadPath = path.join(__dirname, '../uploads/live-photos');
    } else {
      uploadPath = path.join(__dirname, '../uploads');
    }
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg';
    if (file.fieldname === 'idCard') {
      cb(null, 'id-card-' + uniqueSuffix + ext);
    } else if (file.fieldname === 'livePhoto') {
      cb(null, 'live-photo-' + uniqueSuffix + ext);
    } else {
      cb(null, 'file-' + uniqueSuffix + ext);
    }
  }
});

// File filter for registration (accepts images for both fields)
const registrationFileFilter = (req, file, cb) => {
  if (file.fieldname === 'idCard') {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';
    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPG, PNG, and PDF files are allowed for ID cards'));
  } else if (file.fieldname === 'livePhoto') {
    if (file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed for live photos'));
  } else {
    cb(null, true);
  }
};

// Multer configuration for registration with multiple files
const uploadRegistration = multer({
  storage: registrationStorage,
  fileFilter: registrationFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size allowed is 10MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

module.exports = {
  uploadIdCard: uploadIdCard.single('idCard'),
  uploadReport: uploadReport.single('reportFile'),
  uploadAcceptanceLetter: uploadAcceptanceLetter.single('acceptanceLetter'),
  uploadApplicationAttachment: uploadApplicationAttachment.single('attachment'),
  uploadLivePhoto: uploadLivePhoto.single('livePhoto'),
  uploadRegistration: uploadRegistration.fields([
    { name: 'idCard', maxCount: 1 },
    { name: 'livePhoto', maxCount: 1 }
  ]),
  handleMulterError
};
