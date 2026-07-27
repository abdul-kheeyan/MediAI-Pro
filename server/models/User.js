const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: { background: true } },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'pharmacy', 'admin'],
        default: 'patient'
    },
    specialization: { type: String }, // For doctors
    qualifications: { type: String }, // For doctors
    shopName: { type: String },       // For pharmacy owners
    profileImage: { type: String },
    bloodGroup: { type: String },
    bio: { type: String },
    phone: { type: String },
    address: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    dateOfBirth: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
