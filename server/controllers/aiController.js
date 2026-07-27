const aiService = require('../services/aiService');
const User = require('../models/User');

// @desc Analyze medical report text
// @route POST /api/ai/analyze-report
exports.analyzeReport = async (req, res) => {
    try {
        const { reportText } = req.body;
        if (!reportText) {
            return res.status(400).json({ message: 'Report text is required for analysis' });
        }

        const analysis = await aiService.analyzeMedicalReport(reportText);
        res.json({ analysis });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Generate personalized diet plan
// @route POST /api/ai/diet-plan
exports.getDietPlan = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Merge DB profile (name, bloodGroup, etc.) with form data from frontend
        // Form data takes priority over DB profile for diet-specific fields
        const profileData = {
            ...user.toObject(),
            ...req.body, // weight, height, activityLevel, goal, medicalConditions, allergies, foodPreference
        };

        const dietPlan = await aiService.generateDietPlan(profileData);
        res.json({ dietPlan });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get daily health tip
// @route GET /api/ai/health-tip
exports.getHealthTip = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const healthTip = await aiService.getHealthTip(user);
        res.json({ healthTip });
    } catch (error) {
        // Fallback tip
        res.json({ healthTip: "Keep moving! A 30-minute walk every day can significantly improve your cardiovascular health." });
    }
};
