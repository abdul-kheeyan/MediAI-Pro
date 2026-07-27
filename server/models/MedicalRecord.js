const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    diagnosis: { type: String },
    prescription: [{
        medicine: String,
        dosage: String,
        frequency: String,
        duration: String,
    }],
    attachments: [String], // URLs to uploaded files
    notes: String,
    aiAnalysis: String,
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
