const mongoose = require('mongoose');

const systemSettingSchema = mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g., 'editWindowMinutes'
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    description: { type: String }
}, { timestamps: true });

const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);
module.exports = SystemSetting;
