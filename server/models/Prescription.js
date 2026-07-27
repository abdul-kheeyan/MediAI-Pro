const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicines: [{
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String }
    }],
    diagnosis: { type: String },
    instructions: { type: String },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
