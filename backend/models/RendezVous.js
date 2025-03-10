const mongoose = require('mongoose');

const rendezVousSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    dateHeure: { type: Date, required: true },
    heureFin: { type: Date, required: true },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true }],
    etat: { type: String, enum: ['En attente', 'Confirmé', 'Terminé'], default: 'En attente' },
    mecaniciens: [{
        mecanicienId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mecanicien', required: true },
        servicesEffectues: [{
            serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
            heureDebut: { type: Date, required: true },  // Heure de début du service
            heureFin: { type: Date, required: true }     // Heure de fin du service
        }]
    }],
    articlesUtilises: [
        {
            article: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: false },
            quantite: { type: Number, required: false }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('RendezVous', rendezVousSchema);
