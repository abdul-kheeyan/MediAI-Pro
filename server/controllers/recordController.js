const MedicalRecord = require('../models/MedicalRecord');
const aiService = require('../services/aiService');

// @desc Analyze medical record with AI
// @route POST /api/records/:id/analyze
exports.analyzeRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }

        // Use diagnosis and notes as context for AI
        const reportText = `Diagnosis: ${record.diagnosis}. Clinical Notes: ${record.notes}`;
        const analysis = await aiService.analyzeMedicalReport(reportText);

        record.aiAnalysis = analysis;
        await record.save();

        res.json({ analysis });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ... existing functions ...

// @desc Create medical record
// @route POST /api/records
exports.createRecord = async (req, res) => {
    try {
        const { patientId, diagnosis, prescription, notes } = req.body;

        let attachments = [];
        if (req.file) {
            attachments.push(`/uploads/${req.file.filename}`);
        }

        // Only doctors or admins can create records
        if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
            return res.status(401).json({ message: 'Not authorized to create records for others' });
        }

        const record = await MedicalRecord.create({
            patient: patientId || req.user._id,
            doctor: req.user._id,
            diagnosis,
            prescription: prescription ? JSON.parse(prescription) : [],
            notes,
            attachments
        });

        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get user records
// @route GET /api/records
exports.getRecords = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'patient') {
            query = { patient: req.user._id };
        } else if (req.user.role === 'doctor') {
            query = { doctor: req.user._id };
        }

        const records = await MedicalRecord.find(query)
            .populate('patient', 'name email profileImage')
            .populate('doctor', 'name email specialization profileImage')
            .sort({ date: -1 });

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get single record
// @route GET /api/records/:id
exports.getRecordById = async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id)
            .populate('patient', 'name email profileImage')
            .populate('doctor', 'name email specialization profileImage');

        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }

        // Auth check
        if (
            record.patient._id.toString() !== req.user._id.toString() &&
            record.doctor._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
