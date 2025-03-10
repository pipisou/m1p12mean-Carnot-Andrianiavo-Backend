const express = require('express');
const router = express.Router();
const Specialite = require('../models/Specialite');

// Créer une nouvelle spécialité
router.post('/', async (req, res) => {
    try {
        const { typeSpecialite } = req.body;

        // Vérifier si la spécialité existe déjà
        const existingSpecialite = await Specialite.findOne({ typeSpecialite });
        if (existingSpecialite) {
            return res.status(400).json({ error: "Spécialité déjà existante" });
        }

        // Créer la nouvelle spécialité
        const newSpecialite = new Specialite({ typeSpecialite });
        await newSpecialite.save();

        res.status(201).json({ message: "Spécialité créée avec succès", specialite: newSpecialite });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Récupérer toutes les spécialités
router.get('/', async (req, res) => {
    try {
        const specialites = await Specialite.find();
        res.json(specialites);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Récupérer une spécialité par ID
router.get('/:id', async (req, res) => {
    try {
        const specialite = await Specialite.findById(req.params.id);
        if (!specialite) return res.status(404).json({ error: "Spécialité non trouvée" });

        res.json(specialite);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Modifier une spécialité
router.put('/:id', async (req, res) => {
    try {
        const { typeSpecialite } = req.body;

        // Vérifier si la spécialité existe
        let specialite = await Specialite.findById(req.params.id);
        if (!specialite) return res.status(404).json({ error: "Spécialité non trouvée" });

        // Mise à jour de la spécialité
        specialite = await Specialite.findByIdAndUpdate(
            req.params.id,
            { typeSpecialite },
            { new: true }
        );

        res.json({ message: "Spécialité mise à jour", specialite });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Supprimer une spécialité
router.delete('/:id', async (req, res) => {
    try {
        const specialite = await Specialite.findById(req.params.id);
        if (!specialite) return res.status(404).json({ error: "Spécialité non trouvée" });

        await Specialite.findByIdAndDelete(req.params.id);
        res.json({ message: "Spécialité supprimée" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
