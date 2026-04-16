const express = require('express');
const { getDashboard } = require('../controllers/issueController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Accessible only to Citizen role
router.use(authMiddleware);
router.use(roleMiddleware(['Citizen']));

router.get('/', getDashboard);

module.exports = router;
