const express = require('express');
const Devis = require('../models/Devis');
const Tache = require('../models/Tache');
const RendezVous = require('../models/RendezVous');
const generateDevisReference = require('../models/generateDevisReference');
const { authMiddleware,authClientMiddleware} = require('../middlewares/authMiddleware');

const router = express.Router();

// ✅ Création d'un devis (CLIENT UNIQUEMENT)
router.post('/', authClientMiddleware, async (req, res) => {
    try {
        const { taches, dateDemande } = req.body;  // Ajout de dateDemande dans le corps de la requête

        if (!Array.isArray(taches) || taches.length === 0) {
            return res.status(400).json({ message: 'Une liste de tâches est requise' });
        }

        const tachesExistantes = await Tache.find({ _id: { $in: taches } });
        if (tachesExistantes.length !== taches.length) {
            return res.status(400).json({ message: 'Une ou plusieurs tâches sont invalides' });
        }

        const referenceDevis = await generateDevisReference();

        const devis = new Devis({
            referenceDevis,
            client: req.user.id,
            taches
        });

        await devis.save();  // Enregistrer le devis

        // Une fois le devis créé, créer un rendez-vous avec statut "en attente"
        const rendezVous = new RendezVous({
            client: req.user.id,
            devis: devis._id,  // Utiliser l'ID du devis créé
            dateDemande: dateDemande,  // Passer la plage de dates demandée
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


// ✅ Récupérer tous les devis (AUTHENTIFICATION REQUISE)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const devis = await Devis.find()
            .populate('client')
            .populate('taches');

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
            .populate('taches');

        if (!devis) return res.status(404).json({ message: 'Devis non trouvé' });

        res.json(devis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Mettre à jour un devis (AUTHENTIFICATION REQUISE)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { taches } = req.body;

        if (!Array.isArray(taches) || taches.length === 0) {
            return res.status(400).json({ message: 'Une liste de tâches est requise' });
        }

        const devis = await Devis.findById(req.params.id);
        if (!devis) return res.status(404).json({ message: 'Devis non trouvé' });

        devis.taches = taches;
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
// ✅ Récupérer tous les devis d'un client (CLIENT UNIQUEMENT)
router.get('/client', authClientMiddleware, async (req, res) => {
    try {
        const devis = await Devis.find({ client: req.user.id })
        .populate('client')
        .populate('taches');

        res.json(devis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
