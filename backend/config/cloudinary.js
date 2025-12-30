const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage for ID Cards
const idCardStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'internship/id-cards',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto'
  }
});

// Storage for Live Photos
const livePhotoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'internship/live-photos',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    resource_type: 'image'
  }
});

// Storage for Acceptance Letters - use dynamic params based on file type
const acceptanceLetterStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    return {
      folder: 'internship/acceptance-letters',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      resource_type: isPdf ? 'raw' : 'image'  // PDFs as raw, images as image
    };
  }
});

// Storage for Reports - PDFs should be raw type
const reportStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'internship/reports',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw'  // Documents should always be raw
  }
});

// Storage for Application Attachments (CV/Resume) - PDFs should be raw type
const attachmentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'internship/attachments',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw'  // Documents should always be raw
  }
});

// Create multer upload instances
const uploadIdCard = multer({ storage: idCardStorage });
const uploadLivePhoto = multer({ storage: livePhotoStorage });
const uploadAcceptanceLetter = multer({ storage: acceptanceLetterStorage });
const uploadReport = multer({ storage: reportStorage });
const uploadAttachment = multer({ storage: attachmentStorage });

// Combined upload for registration (ID card + Live photo)
const uploadRegistration = multer({
  storage: new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      if (file.fieldname === 'idCard') {
        return {
          folder: 'internship/id-cards',
          allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
          resource_type: 'auto'
        };
      } else if (file.fieldname === 'livePhoto') {
        return {
          folder: 'internship/live-photos',
          allowed_formats: ['jpg', 'jpeg', 'png'],
          resource_type: 'image'
        };
      }
      return {
        folder: 'internship/misc',
        resource_type: 'auto'
      };
    }
  })
});

// Error handler for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed'
    });
  }
  next();
};

module.exports = {
  cloudinary,
  uploadIdCard: uploadIdCard.single('idCard'),
  uploadLivePhoto: uploadLivePhoto.single('livePhoto'),
  uploadAcceptanceLetter: uploadAcceptanceLetter.single('acceptanceLetter'),
  uploadReport: uploadReport.single('reportFile'),
  uploadAttachment: uploadAttachment.single('attachment'),
  uploadRegistration: uploadRegistration.fields([
    { name: 'idCard', maxCount: 1 },
    { name: 'livePhoto', maxCount: 1 }
  ]),
  handleMulterError
};
