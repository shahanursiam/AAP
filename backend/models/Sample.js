const mongoose = require('mongoose');

const sampleSchema = mongoose.Schema({
  sku: { type: String, required: true },
  styleNo: { type: String },
  poNumber: { type: String },
  itemNumber: { type: String },
  name: { type: String, required: true },
  size: { type: String },
  color: { type: String },
  buyer: { type: String }, // Customer Name
  season: { type: String },
  supplier: { type: String },
  vendor: { type: String },
  factory: { type: String },
  sampleDate: { type: Date, default: Date.now },
  fabricType: { type: String }, // Details
  fabricDetails: { type: String },
  remarks: { type: String },
  sampleType: { type: String, enum: ['proto', 'fit', 'pp', 'shipment', 'production'], required: true },
  barcodes: [{ type: String }], // Multiple barcodes if multiple items for one sample entry
  quantity: { type: Number, default: 1 },
  hanger: { type: String }, // New: Hanger Number (for Display/Merch)
  carton: { type: String }, // New: Carton Number (for Store)
  currentLocation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  status: { type: String, enum: ['Created', 'Received', 'In QC', 'In Transit', 'Delivered', 'Approved', 'Rejected', 'Closed'], default: 'Created' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Sample = mongoose.model('Sample', sampleSchema);
module.exports = Sample;
