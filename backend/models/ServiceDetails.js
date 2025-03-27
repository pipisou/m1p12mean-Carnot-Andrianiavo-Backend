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
    }
}, { timestamps: true });

module.exports = mongoose.model('ServiceDetails', serviceDetailsSchema);
