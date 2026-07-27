const express = require('express');
const { bookAppointment, getAppointments, updateStatus } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, bookAppointment)
    .get(protect, getAppointments);

router.put('/:id', protect, updateStatus);

module.exports = router;
