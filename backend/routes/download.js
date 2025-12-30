const express = require('express');
const router = express.Router();
const https = require('https');
const http = require('http');
const { isAuthenticated } = require('../middleware/auth');
const User = require('../models/User');
const Application = require('../models/Application');
const { cloudinary } = require('../config/cloudinary');

// Extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;

  // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{public_id}.{ext}
  // or: https://res.cloudinary.com/{cloud}/raw/upload/v{version}/{folder}/{public_id}.{ext}
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    let pathPart = parts[1];
    // Remove version if present (v1234567890/)
    if (pathPart.match(/^v\d+\//)) {
      pathPart = pathPart.replace(/^v\d+\//, '');
    }

    // Remove file extension for public_id
    const lastDot = pathPart.lastIndexOf('.');
    if (lastDot > 0) {
      return pathPart.substring(0, lastDot);
    }
    return pathPart;
  } catch (e) {
    console.error('Error extracting public_id:', e);
    return null;
  }
};

// Get resource type from URL (image, raw, video)
const getResourceTypeFromUrl = (url) => {
  if (url.includes('/image/upload/')) return 'image';
  if (url.includes('/raw/upload/')) return 'raw';
  if (url.includes('/video/upload/')) return 'video';
  return 'auto';
};

// Generate signed URL for Cloudinary resource
const getSignedUrl = (originalUrl) => {
  const publicId = getPublicIdFromUrl(originalUrl);
  if (!publicId) return originalUrl;

  const resourceType = getResourceTypeFromUrl(originalUrl);

  // Generate signed URL with attachment flag to force download
  // Use 'upload' type since files were uploaded as public
  const signedUrl = cloudinary.url(publicId, {
    resource_type: resourceType,
    type: 'upload',
    sign_url: true,
    secure: true,
    flags: 'attachment'  // Force download instead of display
  });

  console.log('Generated signed URL for:', publicId);
  return signedUrl;
};

// Try to get resource using Cloudinary API (for authenticated access)
const getResourceViaApi = async (originalUrl) => {
  const publicId = getPublicIdFromUrl(originalUrl);
  const resourceType = getResourceTypeFromUrl(originalUrl);

  if (!publicId) return null;

  try {
    // Get resource info from Cloudinary API
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType
    });

    // Return the secure URL from API response
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary API error:', error.message);
    return null;
  }
};

// Helper function to fetch and stream file from URL
const streamFile = (url, res, filename) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (fileResponse) => {
      // Handle redirects
      if (fileResponse.statusCode >= 300 && fileResponse.statusCode < 400 && fileResponse.headers.location) {
        streamFile(fileResponse.headers.location, res, filename).then(resolve).catch(reject);
        return;
      }

      if (fileResponse.statusCode !== 200) {
        reject(new Error(`Failed to fetch file: ${fileResponse.statusCode}`));
        return;
      }

      // Get content type from response or default to octet-stream
      const contentType = fileResponse.headers['content-type'] || 'application/octet-stream';

      // Set headers for download
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      if (fileResponse.headers['content-length']) {
        res.setHeader('Content-Length', fileResponse.headers['content-length']);
      }

      // Pipe the file to response
      fileResponse.pipe(res);

      fileResponse.on('end', () => resolve());
      fileResponse.on('error', (err) => reject(err));
    }).on('error', (err) => reject(err));
  });
};

// @route   GET /api/download/acceptance-letter/:userId
// @desc    Download acceptance letter for a user
// @access  Private
router.get('/acceptance-letter/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only download their own acceptance letter (or admin/dean can download any)
    if (req.user._id.toString() !== userId &&
        req.user.role !== 'company-admin' &&
        req.user.role !== 'dean') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.acceptanceLetterPath) {
      return res.status(404).json({
        success: false,
        message: 'No acceptance letter found'
      });
    }

    // Generate filename
    const ext = user.acceptanceLetterPath.split('.').pop() || 'pdf';
    const filename = `acceptance-letter-${user.fullName.replace(/\s+/g, '-')}.${ext}`;

    // Try original URL first, then signed URL, then API URL
    let fileUrl = user.acceptanceLetterPath;

    try {
      await streamFile(fileUrl, res, filename);
    } catch (error) {
      // If original URL fails (401/403), try alternatives
      if (error.message.includes('401') || error.message.includes('403')) {
        console.log('Original URL failed with', error.message);

        // Try signed URL first
        try {
          console.log('Trying signed URL...');
          const signedUrl = getSignedUrl(user.acceptanceLetterPath);
          await streamFile(signedUrl, res, filename);
        } catch (signedError) {
          console.log('Signed URL failed:', signedError.message);

          // Try getting URL via API
          console.log('Trying Cloudinary API...');
          const apiUrl = await getResourceViaApi(user.acceptanceLetterPath);
          if (apiUrl) {
            await streamFile(apiUrl, res, filename);
          } else {
            throw new Error('All download methods failed');
          }
        }
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('Download acceptance letter error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to download file',
        error: error.message
      });
    }
  }
});

// @route   GET /api/download/attachment/:applicationId
// @desc    Download CV/Resume attachment for an application
// @access  Private
router.get('/attachment/:applicationId', isAuthenticated, async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId).populate('student');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check permissions
    const isOwner = application.student._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'company-admin';
    const isAssignedAdvisor = application.assignedAdvisor &&
                              application.assignedAdvisor.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin && !isAssignedAdvisor) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!application.attachmentPath) {
      return res.status(404).json({
        success: false,
        message: 'No attachment found'
      });
    }

    // Generate filename
    const ext = application.attachmentPath.split('.').pop() || 'pdf';
    const studentName = application.student.fullName.replace(/\s+/g, '-');
    const filename = `CV-${studentName}.${ext}`;

    // Try original URL first, then signed URL if that fails
    let fileUrl = application.attachmentPath;

    try {
      await streamFile(fileUrl, res, filename);
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        console.log('Original URL failed, trying signed URL...');
        const signedUrl = getSignedUrl(application.attachmentPath);
        await streamFile(signedUrl, res, filename);
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('Download attachment error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to download file',
        error: error.message
      });
    }
  }
});

// @route   GET /api/download/id-card/:userId
// @desc    Download ID card for a user (Admin/Dean only)
// @access  Private (Admin/Dean)
router.get('/id-card/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;

    // Only admin or dean can download ID cards
    if (req.user.role !== 'company-admin' && req.user.role !== 'dean') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.idCardPath) {
      return res.status(404).json({
        success: false,
        message: 'No ID card found'
      });
    }

    // Generate filename
    const ext = user.idCardPath.split('.').pop() || 'png';
    const filename = `id-card-${user.fullName.replace(/\s+/g, '-')}.${ext}`;

    // Try original URL first, then signed URL if that fails
    try {
      await streamFile(user.idCardPath, res, filename);
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        console.log('Original URL failed, trying signed URL...');
        const signedUrl = getSignedUrl(user.idCardPath);
        await streamFile(signedUrl, res, filename);
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('Download ID card error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to download file',
        error: error.message
      });
    }
  }
});

module.exports = router;
