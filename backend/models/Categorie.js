const mongoose = require('mongoose');

const categorieSchema = new mongoose.Schema({
    nomCategorie: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Categorie', categorieSchema);
