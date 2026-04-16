const express = require('express');
const { getAllIssues, updateIssueStatus } = require('../controllers/issueController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Accessible only to GOV role
router.use(authMiddleware);
router.use(roleMiddleware(['GOV']));

router.get('/grievances', getAllIssues);
router.patch('/grievances/:id/status', updateIssueStatus);

module.exports = router;
