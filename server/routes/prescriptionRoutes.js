const express = require('express');
const { createPrescription, getPrescriptions, getPrescriptionById } = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, createPrescription)
    .get(protect, getPrescriptions);

router.get('/:id', protect, getPrescriptionById);

module.exports = router;
