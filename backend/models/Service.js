const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    nomService: { type: String, required: true },
    description: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
