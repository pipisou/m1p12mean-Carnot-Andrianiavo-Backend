const mongoose = require('mongoose');

const horaireSchema = new mongoose.Schema({
    mecanicien: { type: mongoose.Schema.Types.ObjectId, ref: 'Mecanicien', required: true },
    joursTravail: [
        {
            jour: { 
                type: String, 
                enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'], 
                required: true 
            },
            debut: { type: String, required: true }, // Heure de début
            fin: { type: String, required: true } // Heure de fin
        }
    ],
    dateDebut: { type: Date, default: Date.now } // Date d'entrée en vigueur de l'horaire
}, { timestamps: true });

module.exports = mongoose.model('Horaire', horaireSchema);
