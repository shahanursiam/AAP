const mongoose = require('mongoose');

const movementLogSchema = mongoose.Schema({
  sample_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sample', required: true },
  action: { type: String, enum: ['CREATED', 'MOVED', 'STATUS_CHANGE', 'QC_PASS', 'QC_FAIL', 'DISTRIBUTE', 'INTERNAL_TRANSFER', 'INVOICE_SENT', 'RETURN', 'INVOICE_APPROVED', 'INVOICE_REJECTED', 'UPDATED_VIA_APPROVAL', 'DELETED_VIA_APPROVAL'], required: true },
  fromLocation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  toLocation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who did this
  quantity: { type: Number },
  comments: { type: String },
  metadata: { type: Map, of: String } // Flexible for extra data
}, { timestamps: true });

const MovementLog = mongoose.model('MovementLog', movementLogSchema);
module.exports = MovementLog;
