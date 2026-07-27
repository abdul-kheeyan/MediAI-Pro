const Prescription = require('../models/Prescription');
const Notification = require('../models/Notification');

// @desc Create a new prescription
// @route POST /api/prescriptions
exports.createPrescription = async (req, res) => {
    try {
        const { patientId, medicines, diagnosis, instructions } = req.body;

        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only doctors can create prescriptions' });
        }

        const prescription = await Prescription.create({
            patient: patientId,
            doctor: req.user._id,
            medicines,
            diagnosis,
            instructions
        });

        // Create Real-time Notification
        const notification = await Notification.create({
            user: patientId,
            title: 'New Prescription Received',
            message: `Dr. ${req.user.name} has issued a new prescription for your diagnosis: ${diagnosis}`,
            type: 'prescription'
        });

        // Emit via Socket.io
        if (global.io) {
            global.io.to(patientId).emit('notification', notification);
        }

        res.status(201).json(prescription);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get prescriptions for a user
// @route GET /api/prescriptions
exports.getPrescriptions = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'patient') {
            query = { patient: req.user._id };
        } else if (req.user.role === 'doctor') {
            query = { doctor: req.user._id };
        }

        const prescriptions = await Prescription.find(query)
            .populate('patient', 'name email profileImage')
            .populate('doctor', 'name email specialization')
            .sort({ date: -1 });

        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get single prescription
// @route GET /api/prescriptions/:id
exports.getPrescriptionById = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id)
            .populate('patient', 'name email profileImage')
            .populate('doctor', 'name email specialization');

        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        // Auth check
        if (
            prescription.patient._id.toString() !== req.user._id.toString() &&
            prescription.doctor._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(prescription);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
