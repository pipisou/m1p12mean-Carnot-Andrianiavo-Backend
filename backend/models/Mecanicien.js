const mongoose = require('mongoose');

const mecanicienSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    salaire: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    telephone: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true }], // Référence aux services au lieu des spécialités
    horaire: { type: mongoose.Schema.Types.ObjectId, ref: 'Horaire' }, // Référence au dernier horaire
    absences: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Absence' }] // Références aux absences
}, { timestamps: true });

module.exports = mongoose.model('Mecanicien', mecanicienSchema);
