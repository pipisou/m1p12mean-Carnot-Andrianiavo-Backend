const mongoose = require('mongoose');

const devisSchema = new mongoose.Schema({
    referenceDevis: { 
        type: String, 
        required: true, 
        unique: true  // Assurez-vous que la référence est unique
    },
    description: { 
        type: String, 
        required: true
    },
    client: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Client', 
        required: false // Le client est facultatif, peut être null si créé par un administrateur
    },
    serviceDetails: [{ 
        service: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceDetails', required: true },
        taches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tache', required: true }]
    }]
}, { timestamps: true });

module.exports = mongoose.model('Devis', devisSchema);
