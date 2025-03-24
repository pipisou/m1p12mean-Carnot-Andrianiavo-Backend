const express = require('express');
const CategorieDeVehicule = require('../models/CategorieDeVehicule');
const router = express.Router();

// Création d'une nouvelle catégorie de véhicule (POST)
router.post('/', async (req, res) => {
    try {
        const { nom, description } = req.body;

        // Vérifier si la catégorie existe déjà
        const categorieExist = await CategorieDeVehicule.findOne({ nom });
        if (categorieExist) return res.status(400).json({ message: 'Catégorie déjà existante' });

        const categorieDeVehicule = new CategorieDeVehicule({
            nom,
            description
        });

        await categorieDeVehicule.save();
        res.status(201).json({ message: 'Catégorie de véhicule créée', categorieDeVehicule });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Récupérer toutes les catégories de véhicules (GET)
router.get('/', async (req, res) => {
    try {
        const categories = await CategorieDeVehicule.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Récupérer une catégorie de véhicule par son ID (GET)
router.get('/:id', async (req, res) => {
    try {
        const categorieDeVehicule = await CategorieDeVehicule.findById(req.params.id);
        if (!categorieDeVehicule) return res.status(404).json({ message: 'Catégorie non trouvée' });
        res.json(categorieDeVehicule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mise à jour d'une catégorie de véhicule (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { nom, description } = req.body;

        const categorieDeVehicule = await CategorieDeVehicule.findByIdAndUpdate(
            req.params.id,
            { nom, description },
            { new: true }
        );

        if (!categorieDeVehicule) return res.status(404).json({ message: 'Catégorie non trouvée' });
        res.json(categorieDeVehicule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Suppression d'une catégorie de véhicule (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const categorieDeVehicule = await CategorieDeVehicule.findByIdAndDelete(req.params.id);
        if (!categorieDeVehicule) return res.status(404).json({ message: 'Catégorie non trouvée' });
        res.json({ message: 'Catégorie supprimée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
