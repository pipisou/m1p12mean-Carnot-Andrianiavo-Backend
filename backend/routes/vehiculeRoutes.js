const express = require('express');
const router = express.Router();
const Vehicule = require('../models/Vehicule');
const { authClientMiddleware, authManagerMiddleware } = require('../middlewares/authMiddleware');

// Ajouter un véhicule - Nécessite un token client
router.post('/', authClientMiddleware, async (req, res) => {
    try {
        const { immatriculation, categorie } = req.body;

        // Vérifier si le véhicule existe déjà
        const existingVehicule = await Vehicule.findOne({ immatriculation });
        if (existingVehicule) {
            return res.status(400).json({ error: "Ce véhicule est déjà enregistré." });
        }

        // Créer le véhicule
        const newVehicule = new Vehicule({
            immatriculation,
            proprietaire: req.user.id,
            categorie
        });
        await newVehicule.save();

        res.status(201).json({ message: "Véhicule ajouté avec succès", vehicule: newVehicule });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Récupérer tous les véhicules - Accessible sans token
router.get('/', async (req, res) => {
    try {
        const vehicules = await Vehicule.find().populate('proprietaire categorie');
        res.json(vehicules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Récupérer un véhicule par ID - Accessible sans token
router.get('/:id', async (req, res) => {
    try {
        const vehicule = await Vehicule.findById(req.params.id).populate('proprietaire categorie');
        if (!vehicule) return res.status(404).json({ error: "Véhicule non trouvé" });

        res.json(vehicule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Récupérer tous les véhicules du client - Nécessite un token client
router.get('/client', authClientMiddleware, async (req, res) => {
    try {
        const vehicules = await Vehicule.find({ proprietaire: req.user.id }).populate('categorie');

        if (!vehicules || vehicules.length === 0) {
            return res.status(404).json({ error: "Aucun véhicule trouvé pour ce client." });
        }

        res.json(vehicules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Modifier un véhicule - Nécessite un token client
router.put('/:id', authClientMiddleware, async (req, res) => {
    try {
        const { immatriculation, categorie } = req.body;

        // Vérifier si le véhicule existe
        let vehicule = await Vehicule.findById(req.params.id);
        if (!vehicule) return res.status(404).json({ error: "Véhicule non trouvé" });

        // Vérifier si l'utilisateur est bien le propriétaire
        if (vehicule.proprietaire.toString() !== req.user.id) {
            return res.status(403).json({ error: "Accès non autorisé" });
        }

        // Mise à jour
        vehicule = await Vehicule.findByIdAndUpdate(
            req.params.id,
            { immatriculation, categorie },
            { new: true }
        );

        res.json({ message: "Véhicule mis à jour", vehicule });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Supprimer un véhicule - Seulement pour les managers
router.delete('/:id', authManagerMiddleware, async (req, res) => {
    try {
        const vehicule = await Vehicule.findById(req.params.id);
        if (!vehicule) return res.status(404).json({ error: "Véhicule non trouvé" });

        await Vehicule.findByIdAndDelete(req.params.id);
        res.json({ message: "Véhicule supprimé" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
