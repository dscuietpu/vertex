const express = require('express');
const { createIssue, getMyIssues } = require('../controllers/issueController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Route for multer errors
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof require('multer').MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// Accessible only to Citizen role
router.use(authMiddleware);
router.use(roleMiddleware(['Citizen']));

router.post('/', upload.single('image'), multerErrorHandler, createIssue);
router.get('/my', getMyIssues);

module.exports = router;
