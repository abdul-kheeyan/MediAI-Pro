const express = require('express');
const { register, login, getDoctors, getDoctorById, getProfile, updateProfile, uploadProfileImage } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/doctors', protect, getDoctors);
router.get('/doctors/:id', protect, getDoctorById);
router.route('/profile')
    .get(protect, getProfile)
    .put(protect, updateProfile);

router.post('/profile/image', protect, upload.single('image'), uploadProfileImage);

module.exports = router;
