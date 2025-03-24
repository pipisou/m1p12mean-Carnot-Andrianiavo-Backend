const mongoose = require('mongoose');

const tacheSchema = new mongoose.Schema({
    serviceDetails: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ServiceDetails', 
        required: true 
    },
    description: { type: String, required: true },
    prix: { type: Number, required: true },
    tempsEstime: { type: Number, required: true },
    marge: { type: Number, default: 10 },
    articlesNecessaires: [{ 
        article: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Article', 
            required: true 
        },
        quantite: { 
            type: Number, 
            required: true, 
            default: 1 
        }
    }],

}, { timestamps: true });

module.exports = mongoose.model('Tache', tacheSchema);
