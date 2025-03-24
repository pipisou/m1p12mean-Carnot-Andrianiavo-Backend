const mongoose = require('mongoose');

const serviceDetailsSchema = new mongoose.Schema({
    service: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Service', 
        required: true 
    },
    categorieDeVehicule: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'CategorieDeVehicule', 
        required: true 
    },
    servicePrerequis: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ServiceDetails',
        required: false // Le servicePrerequis est facultatif, car certains services n'ont pas de prérequis
    }
}, { timestamps: true });

module.exports = mongoose.model('ServiceDetails', serviceDetailsSchema);
