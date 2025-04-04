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
            statut: 'en attente',  // Statut par défaut
            taches: taches.map(tacheId => ({
                tache: tacheId,  // ID de la tâche
                mecanicien: null, // Null pour l'instant
                dateHeureDebut: null, // Null pour l'instant
                dateHeureFin: null, // Null pour l'instant
                statut: 'en attente' // Statut par défaut
            }))
        });

        // Enregistrer le devis et le rendez-vous
        await devis.save();  // Enregistrer le devis
        await rendezVous.save();  // Enregistrer le rendez-vous

        // Retourner les informations du devis et du rendez-vous
        res.status(201).json({
            message: 'Devis et rendez-vous créés avec succès',
            reference: referenceDevis
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ✅ Récupérer tous les devis d'un client (CLIENT UNIQUEMENT)
router.get('/client', authMiddleware, async (req, res) => {
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
router.get('/:id', async (req, res) => {
    try {
        const devis = await Devis.findById(req.params.id)
            .populate('client')
            .populate('taches')
            .populate({
                path: 'vehicule',
                populate: [
                    { path: 'categorie' }
                ]
            });  // Peupler le véhicule lié au devis
          

        if (!devis) return res.status(404).json({ message: 'Devis non trouvé' });

        res.json(devis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Mettre à jour un devis (AUTHENTIFICATION REQUISE)
router.put('/:id',  async (req, res) => {
    try {
        const { taches, vehicule } = req.body;

        // Si taches est fourni, vérifier qu'il soit un tableau
        if (taches !== undefined && !Array.isArray(taches)) {
            return res.status(400).json({ message: 'Le champ taches doit être un tableau' });
        }

        const devis = await Devis.findById(req.params.id);
        if (!devis) return res.status(404).json({ message: 'Devis non trouvé' });

        // Sauvegarde des anciennes tâches du devis avant modification
        const anciennesTaches = devis.taches;

        // Si taches est fourni et n'est pas vide, on les met à jour
        devis.taches = taches || []; // Si taches est vide ou non défini, on met un tableau vide

        // Si un véhicule est fourni, on met à jour le véhicule
        if (vehicule) {
            devis.vehicule = vehicule;
        }

        // Sauvegarder les modifications du devis
        await devis.save();

        // Mettre à jour les tâches dans le rendez-vous associé au devis
        const rendezVous = await RendezVous.findOne({ devis: devis._id });
        if (rendezVous) {
            // Conserver les anciennes tâches et ajouter les nouvelles
            const nouvellesTaches = taches || [];

            // Supprimer les tâches qui ne sont plus dans le devis
            rendezVous.taches = rendezVous.taches.filter(tache => 
                nouvellesTaches.includes(tache.tache.toString()) // On garde uniquement celles présentes dans le devis
            );

            // Ajouter les nouvelles tâches qui ne sont pas encore dans le rendez-vous
            for (let tacheId of nouvellesTaches) {
                const tacheExistante = rendezVous.taches.some(t => t.tache.toString() === tacheId);
                if (!tacheExistante) {
                    rendezVous.taches.push({
                        tache: tacheId,  // ID de la tâche
                        mecanicien: null, // Null pour l'instant
                        dateHeureDebut: null, // Null pour l'instant
                        dateHeureFin: null, // Null pour l'instant
                        statut: 'en attente' // Statut par défaut
                    });
                }
            }

            // Sauvegarder les modifications du rendez-vous
            await rendezVous.save();
        }

        res.json({ message: 'Devis et rendez-vous mis à jour avec succès', devis });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ✅ Supprimer un devis et les rendez-vous associés (AUTHENTIFICATION REQUISE)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const devis = await Devis.findById(req.params.id);
        if (!devis) return res.status(404).json({ message: 'Devis non trouvé' });

        // Supprimer les rendez-vous associés au devis
        await RendezVous.deleteMany({ devis: devis._id });

        // Supprimer le devis
        await devis.deleteOne();

        res.json({ message: 'Devis et rendez-vous associés supprimés avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
