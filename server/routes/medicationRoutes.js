const express = require('express');
const { addMedication, getMedications, updateMedication, deleteMedication } = require('../controllers/medicationController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, addMedication)
    .get(protect, getMedications);

router.route('/:id')
    .put(protect, updateMedication)
    .delete(protect, deleteMedication);

module.exports = router;
