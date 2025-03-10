const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    nomService: { type: String, required: true },
    description: { type: String, required: true },
    specialites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Specialite', required: true }],
    prix: { type: Number, required: true },
    tempsEstime: { type: Number, required: true }  // en heures ou minutes
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
