const express = require('express');
const Categorie = require('../models/Categorie');

const router = express.Router();

// Création d'une catégorie (POST)
router.post('/', async (req, res) => {
    try {
        const { nomCategorie } = req.body;

        // Vérifier si la catégorie existe déjà
        const categorieExist = await Categorie.findOne({ nomCategorie });
        if (categorieExist) {
            return res.status(400).json({ message: "Cette catégorie existe déjà." });
        }

        // Création de la catégorie
        const nouvelleCategorie = new Categorie({ nomCategorie });
        await nouvelleCategorie.save();
        res.status(201).json({ message: "Catégorie créée", categorie: nouvelleCategorie });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Récupérer toutes les catégories (GET)
router.get('/', async (req, res) => {
    try {
        const categories = await Categorie.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Récupérer une catégorie par son ID (GET)
router.get('/:id', async (req, res) => {
    try {
        const categorie = await Categorie.findById(req.params.id);
        if (!categorie) {
            return res.status(404).json({ message: "Catégorie non trouvée." });
        }
        res.json(categorie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mise à jour d'une catégorie (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { nomCategorie } = req.body;

        const categorie = await Categorie.findByIdAndUpdate(
            req.params.id,
            { nomCategorie },
            { new: true }
        );

        if (!categorie) {
            return res.status(404).json({ message: "Catégorie non trouvée." });
        }

        res.json({ message: "Catégorie mise à jour", categorie });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Suppression d'une catégorie (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const categorie = await Categorie.findByIdAndDelete(req.params.id);

        if (!categorie) {
            return res.status(404).json({ message: "Catégorie non trouvée." });
        }

        res.json({ message: "Catégorie supprimée avec succès." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
