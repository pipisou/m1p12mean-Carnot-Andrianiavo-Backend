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
    mecaniciens: [
        { 
            mecanicien: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Mecanicien', 
                required: true 
            },
            services: [
                {
                    service: { 
                        type: mongoose.Schema.Types.ObjectId, 
                        ref: 'Service', 
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

    // Date demandée par le client entre deux dates
    dateDemande: {
        type: [Date],
        required: true  // Le client choisit une plage de dates
    },

    // Date validée par le manager
    dateChoisie: {
        type: Date,
        required: false  // La date choisie sera validée plus tard par le manager
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

    statut: {
        type: String,
        enum: ['en attente','demande de validtion', 'reprogrammé intervale','reprogrammé dateChoisie','validé', 'en cours', 'terminée', 'payé'],
        default: 'en attente'
    }
}, { timestamps: true });

module.exports = mongoose.model('RendezVous', rendezVousSchema);
