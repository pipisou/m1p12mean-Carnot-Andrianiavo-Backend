const mongoose = require('mongoose');
const Article = require('./Article'); // Lien avec le modèle Article

const stockSchema = new mongoose.Schema({
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true }, // Référence vers Article
    quantite: { type: Number, required: true },
    prixVente: { type: Number, required: true }, // Prix de vente
    prixAchat: { type: Number, required: true }, // Prix d'achat
    fournisseur: { type: String, required: true },// Fournisseur
    dateAchat: { type: Date, required: true } // Date d'achat

}, { timestamps: true });

module.exports = mongoose.model('Stock', stockSchema);
