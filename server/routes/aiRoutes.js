const express = require('express');
const { analyzeReport, getDietPlan, getHealthTip } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/analyze-report', protect, analyzeReport);
router.post('/diet-plan', protect, getDietPlan);
router.get('/health-tip', protect, getHealthTip);

module.exports = router;
