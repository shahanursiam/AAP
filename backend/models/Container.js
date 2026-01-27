const mongoose = require('mongoose');

const containerSchema = mongoose.Schema({
    containerId: { type: String, required: true, unique: true }, // Barcode
    type: { type: String, enum: ['Carton', 'Hanger'], required: true },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sample' }],
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    status: { type: String, enum: ['Active', 'Sealed', 'Shipped', 'Closed'], default: 'Active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Container = mongoose.model('Container', containerSchema);

module.exports = Container;
