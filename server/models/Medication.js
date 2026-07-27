const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true }, // e.g., 'Daily', 'Twice a day'
    time: [String], // Array of times e.g., ['08:30', '20:30']
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    active: { type: Boolean, default: true },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Medication', medicationSchema);
