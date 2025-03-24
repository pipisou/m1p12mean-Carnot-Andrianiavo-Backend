const mongoose = require('mongoose');

const categorieDeVehiculeSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    description: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('CategorieDeVehicule', categorieDeVehiculeSchema);
