const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    telephone: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
