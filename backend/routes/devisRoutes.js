const express = require('express');
const Devis = require('../models/Devis');
const Tache = require('../models/Tache');
const RendezVous = require('../models/RendezVous');
const Vehicule = require('../models/Vehicule');
const generateDevisReference = require('../models/generateDevisReference');
const { authMiddleware, authClientMiddleware, authManagerMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { taches, dateDemande, vehicule } = req.body;  // 'vehicule' devient optionnel

        // Vérification de la validité des tâches (elles peuvent être vides)
        if (taches && !Array.isArray(taches)) {
            return res.status(400).json({ message: 'Le champ taches doit être un tableau' });
        }

        // Si des tâches sont spécifiées, vérifier leur validité
        if (taches && taches.length > 0) {
            const tachesExistantes = await Tache.find({ _id: { $in: taches } });
            if (tachesExistantes.length !== taches.length) {
                return res.status(400).json({ message: 'Une ou plusieurs tâches sont invalides' });
            }
        }

        let vehiculeValide = null;

        // Vérification du véhicule uniquement s'il est fourni
        if (vehicule) {
            vehiculeValide = await Vehicule.findById(vehicule);
            if (!vehiculeValide) {
                return res.status(400).json({ message: 'Véhicule non trouvé' });
            }
            if (vehiculeValide.proprietaire.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Ce véhicule ne vous appartient pas' });
            }
        }

        // Générer la référence du devis
        const referenceDevis = await generateDevisReference();

        // Créer le devis (avec ou sans véhicule)
        const devis = new Devis({
            referenceDevis,
            client: req.user.id,
            taches, // Liste des tâches (vide ou non)
            vehicule: vehiculeValide ? vehiculeValide._id : null  // Si pas de véhicule, valeur null
        });

        await devis.save();  // Enregistrer le devis

        // Validation de la plage de dates demandée
        if (!Array.isArray(dateDemande) || dateDemande.length === 0) {
            return res.status(400).json({ message: 'Une plage de dates est requise' });
        }

        for (const date of dateDemande) {
            if (!date.dateHeureDebut || !date.dateHeureFin || isNaN(new Date(date.dateHeureDebut).getTime()) || isNaN(new Date(date.dateHeureFin).getTime())) {
                return res.status(400).json({ message: 'Les dates de la plage demandée sont invalides' });
            }
        }

        // Créer un rendez-vous avec statut "en attente"
        const rendezVous = new RendezVous({
            client: req.user.id,
            devis: devis._id,  // Utiliser l'ID du devis créé
            dateDemande,  // Passer la plage de dates demandée
            statut: 'en attente'  // Statut par défaut
        });

        await rendezVous.save();  // Enregistrer le rendez-vous

        // Retourner les informations du devis et du rendez-vous
        res.status(201).json({
            message: 'Devis et rendez-vous créés avec succès',
            devis,
            rendezVous
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ✅ Récupérer tous les devis d'un client (CLIENT UNIQUEMENT)
router.get('/client', authClientMiddleware, async (req, res) => {
    try {
        const devis = await Devis.find({ client: req.user.id })
            .populate('client')
            .populate('taches')
            .populate('vehicule');  // Peupler aussi le véhicule lié au devis

        res.json(devis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer tous les devis (MANAGER UNIQUEMENT)
router.get('/', authManagerMiddleware, async (req, res) => {
    try {
        // Vérifier si l'utilisateur est un manager (authManagerMiddleware s'en charge)
        
        // Récupérer tous les devis
        const devis = await Devis.find()
            .populate('client')
            .populate('taches')
            .populate('vehicule');  // Peupler aussi le véhicule lié au devis

        res.json(devis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer un devis par son ID (AUTHENTIFICATION REQUISE)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const devis = await Devis.findById(req.params.id)
            .populate('client')
            .populate('taches')
            .populate('vehicule');  // Peupler le véhicule lié au devis

        if (!devis) return res.status(404).json({ message: 'Devis non trouvé' });

        res.json(devis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Mettre à jour un devis (AUTHENTIFICATION REQUISE)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { taches, vehicule } = req.body;

        // Si taches est fourni, vérifier qu'il soit un tableau
        if (taches !== undefined && !Array.isArray(taches)) {
            return res.status(400).json({ message: 'Le champ taches doit être un tableau' });
        }

        const devis = await Devis.findById(req.params.id);
        if (!devis) return res.status(404).json({ message: 'Devis non trouvé' });

        // Si taches est fourni et n'est pas vide, on les met à jour
        devis.taches = taches || []; // Si taches est vide ou non défini, on met un tableau vide

        // Si un véhicule est fourni, on met à jour le véhicule
        if (vehicule) {
            devis.vehicule = vehicule;
        }

        await devis.save();

        res.json({ message: 'Devis mis à jour avec succès', devis });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Supprimer un devis (AUTHENTIFICATION REQUISE)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const devis = await Devis.findById(req.params.id);
        if (!devis) return res.status(404).json({ message: 'Devis non trouvé' });

        await devis.deleteOne();
        res.json({ message: 'Devis supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
