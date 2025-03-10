const mongoose = require('mongoose');

const mecanicienSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    salaire: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    telephone: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true },
    specialites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Specialite', required: true }], // Tableau de spécialités
    horaires: {
        joursTravail: [{ 
            type: String, 
            enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'], 
            default: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'] 
        }],
        debut: { type: String, default: '08:00' }, // Heure de début de travail
        fin: { type: String, default: '16:00' }   // Heure de fin de travail
    },
    absences: [{ type: Date }] // Liste des jours d'absence
}, { timestamps: true });

module.exports = mongoose.model('Mecanicien', mecanicienSchema);
