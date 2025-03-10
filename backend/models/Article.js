const mongoose = require('mongoose');


const articleSchema = new mongoose.Schema({
    nomArticle: { type: String, required: true },
    categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'Categorie', required: true }, // Référence vers Categorie
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);
