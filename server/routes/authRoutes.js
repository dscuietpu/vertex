const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword, deleteAccount } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/profile  — fetch logged-in citizen's data
router.get('/profile', authMiddleware, getProfile);

// PUT /api/auth/profile  — update name / email / profileDetails
router.put('/profile', authMiddleware, updateProfile);

// PUT /api/auth/password  — update user password
router.put('/password', authMiddleware, changePassword);

// DELETE /api/auth/account  — delete user account
router.delete('/account', authMiddleware, deleteAccount);

module.exports = router;
