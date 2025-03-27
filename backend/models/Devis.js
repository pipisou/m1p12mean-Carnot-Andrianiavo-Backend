const mongoose = require('mongoose');

const devisSchema = new mongoose.Schema({
    referenceDevis: { 
        type: String, 
        required: true, 
        unique: true  // Assurez-vous que la référence est unique
    },
    
    client: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Client', 
        required: false // Le client est facultatif, peut être null si créé par un administrateur
    },

    vehicule: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Vehicule', // Référence au modèle Vehicule
        required: false
    },

    taches: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Tache', 
        required: false 
    }]
}, { timestamps: true });

module.exports = mongoose.model('Devis', devisSchema);
