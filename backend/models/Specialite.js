const mongoose = require('mongoose');

const specialiteSchema = new mongoose.Schema({
    typeSpecialite: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Specialite', specialiteSchema);
