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

    // Liste des tâches liées au rendez-vous
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
                required: false // Peut être null au départ
            },
            dateHeureDebut: { 
                type: Date, 
                required: false // On l'ajoutera plus tard
            },
            dateHeureFin: { 
                type: Date, 
                required: false // On l'ajoutera plus tard
            },
            statut: {
                type: String,
                enum: ['en attente', 'en cours', 'terminée'],
                default: 'en attente'
            }
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
                ref: 'Article',  // Référence vers Article au lieu de Stock
                required: false 
            },
            quantite: { 
                type: Number, 
                required: false 
            },
            prixVente: { 
                type: Number, 
                required: false 
            },
            prixAchat: { 
                type: Number, 
                required: false  
            },
            fournisseur: { 
                type: String, 
                required: false  
            }
        }
    ],

    statut: {
        type: String,
        enum: ['en attente', 'validé', 'présent', 'absent', 'payé'],
        default: 'en attente'
    }
}, { timestamps: true });

module.exports = mongoose.model('RendezVous', rendezVousSchema);
