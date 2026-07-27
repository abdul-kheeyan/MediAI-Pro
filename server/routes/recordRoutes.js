const express = require('express');
const { createRecord, getRecords, getRecordById, analyzeRecord } = require('../controllers/recordController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, upload.single('file'), createRecord)
    .get(protect, getRecords);

router.get('/:id', protect, getRecordById);

module.exports = router;
