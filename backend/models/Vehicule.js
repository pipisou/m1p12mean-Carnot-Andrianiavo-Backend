const mongoose = require('mongoose');

const vehiculeSchema = new mongoose.Schema({
    immatriculation: { type: String, required: true, unique: true },
    proprietaire: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'CategorieDeVehicule', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Vehicule', vehiculeSchema);
