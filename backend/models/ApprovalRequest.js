const mongoose = require('mongoose');

const approvalRequestSchema = mongoose.Schema({
    merchandiser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sample: { type: mongoose.Schema.Types.ObjectId, ref: 'Sample', required: true },
    action: { type: String, enum: ['UPDATE', 'DELETE'], required: true },
    data: { type: Object }, // Snapshot of changes or empty for delete
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    adminResponse: { type: String }
}, { timestamps: true });

const ApprovalRequest = mongoose.model('ApprovalRequest', approvalRequestSchema);
module.exports = ApprovalRequest;
