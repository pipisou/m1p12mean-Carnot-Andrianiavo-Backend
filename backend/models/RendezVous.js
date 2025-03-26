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

    // Assignation des mécaniciens avec leurs tâches et horaires
    mecaniciens: [
        { 
            mecanicien: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Mecanicien', 
                required: true 
            },
            taches: [
                {
                    tache: { 
                        type: mongoose.Schema.Types.ObjectId, 
                        ref: 'Tache', 
                        required: true 
                    },
                    dateHeureDebut: { 
                        type: Date, 
                        required: true 
                    },
                    dateHeureFin: { 
                        type: Date, 
                        required: true 
                    }
                }
            ]
        }
    ],

    // Plage de dates demandée par le client
    dateDemande: [
        {
            dateHeureDebut: { type: Date, required: true },
            dateHeureFin: { type: Date, required: true }
        }
    ],

    // Date validée par le manager
    dateChoisie: {
        type: Date
    },

    articlesUtilises: [
        {
            article: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Stock'
            },
            quantite: { 
                type: Number 
            }
        }
    ],

    statut: {
        type: String,
        enum: ['en attente', 'présent', 'absent', 'payé'],
        default: 'en attente'
    }
}, { timestamps: true });

module.exports = mongoose.model('RendezVous', rendezVousSchema);
