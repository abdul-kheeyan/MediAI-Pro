const aiService = require('../services/aiService');

exports.chat = async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ message: 'Messages array is required' });
        }

        const reply = await aiService.analyzeSymptoms(messages);
        res.json({ reply });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
