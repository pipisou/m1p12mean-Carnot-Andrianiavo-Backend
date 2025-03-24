const mongoose = require('mongoose');

const rendezVousSchema = new mongoose.Schema({
    client: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Client', 
        required: true 
    },
    devis: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Devis',
        required: true
    },
    taches: [
        {
            tache: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Tache', 
                required: true 
            },
            mecanicien: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Mecanicien', 
                required: true 
            },
            statut: { 
                type: String, 
                enum: ['en attent','en cours', 'terminée'], 
                default: 'en cours'
            },
            // Date et heure de l'intervention du mécanicien sur cette tâche
            dateHeureIntervention: { 
                type: Date, 
                required: true 
            },
            articlesUtilises: [
                {
                    article: { 
                        type: mongoose.Schema.Types.ObjectId, 
                        ref: 'Stock', 
                        required: false
                    },
                    quantite: { 
                        type: Number, 
                        required: false 
                    }
                }
            ],
        }
    ],
    // Date et heure du rendez-vous global
    dateHeureDebutRendezVous: { 
        type: Date, 
        required: true 
    },
    statut: {
        type: String,
        enum: ['en attente', 'validé', 'refusé'],
        default: 'en attente'
    }
}, { timestamps: true });

module.exports = mongoose.model('RendezVous', rendezVousSchema);
