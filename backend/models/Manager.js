const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
    nom: { type: String, default: "manager" },
    email: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Manager', managerSchema);
