const Medication = require('../models/Medication');

// @desc Add medication reminder
// @route POST /api/medications
exports.addMedication = async (req, res) => {
    try {
        const { name, dosage, frequency, time, startDate, endDate, notes } = req.body;

        const medication = await Medication.create({
            patient: req.user._id,
            name,
            dosage,
            frequency,
            time,
            startDate,
            endDate,
            notes
        });

        res.status(201).json(medication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get user medications
// @route GET /api/medications
exports.getMedications = async (req, res) => {
    try {
        const medications = await Medication.find({ patient: req.user._id, active: true });
        res.json(medications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update medication
// @route PUT /api/medications/:id
exports.updateMedication = async (req, res) => {
    try {
        const medication = await Medication.findById(req.params.id);

        if (!medication) {
            return res.status(404).json({ message: 'Medication not found' });
        }

        if (medication.patient.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedMedication = await Medication.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedMedication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete/Deactivate medication
// @route DELETE /api/medications/:id
exports.deleteMedication = async (req, res) => {
    try {
        const medication = await Medication.findById(req.params.id);

        if (!medication) {
            return res.status(404).json({ message: 'Medication not found' });
        }

        if (medication.patient.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        medication.active = false;
        await medication.save();

        res.json({ message: 'Medication deactivated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
