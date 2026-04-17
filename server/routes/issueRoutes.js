const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const { createIssue, getAllIssues, updateIssueStatus, getHeatmapData, getMyIssues } = require('../controllers/issueController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── Cloudinary & Multer Configuration ────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'civicai_issues',
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, gif, webp)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// ─── Routes ───────────────────────────────────────────────────────────────────
// Public GET routes (map visible to all)
router.get('/heatmap', getHeatmapData);
router.get('/', getAllIssues);

// Citizen only — get only their own issues (for profile page)
router.get(
  '/my',
  authMiddleware,
  roleMiddleware(['Citizen']),
  getMyIssues
);

// Citizen only — submit a new grievance
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Citizen']),
  upload.single('image'),
  createIssue
);

// GOV only — advance grievance status
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['GOV']),
  updateIssueStatus
);

// Multer error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = router;
