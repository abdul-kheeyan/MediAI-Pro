const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        enum: ['Generic', 'Clinical', 'OTC', 'Supplements', 'Equipment'],
        default: 'OTC'
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    prescriptionRequired: {
        type: Boolean,
        default: false
    },
    manufacturer: String,
    expiryDate: Date,
    shopOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
