const mongoose = require('mongoose');

const locationSchema = mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['warehouse', 'office', 'display', 'vendor', 'factory'], required: true },
  address: { type: String },
  capacity: { type: Number },
  manager_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Location = mongoose.model('Location', locationSchema);
module.exports = Location;
