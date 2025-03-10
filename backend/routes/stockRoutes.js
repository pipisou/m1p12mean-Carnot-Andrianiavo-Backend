const express = require('express');
const Stock = require('../models/Stock');
const Article = require('../models/Article');
const router = express.Router();

// 1. Ajouter un nouvel article au stock (POST)
router.post('/', async (req, res) => {
    try {
        const { article, quantite, prixVente, prixAchat, fournisseur, dateAchat } = req.body;

        // Vérifier si l'article existe dans la base de données
        const articleExist = await Article.findById(article);
        if (!articleExist) {
            return res.status(400).json({ message: 'Article invalide' });
        }

        // Ajouter l'article au stock
        const stock = new Stock({
            article,
            quantite,
            prixVente,
            prixAchat,
            fournisseur,
            dateAchat // Ajout de la date d'achat
        });

        await stock.save();
        res.status(201).json({ message: 'Article ajouté au stock avec succès', stock });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Récupérer tous les articles du stock (GET)
router.get('/', async (req, res) => {
    try {
        const stocks = await Stock.find()
            .populate({
                path: 'article',
                populate: {
                    path: 'categorie',
                    model: 'Categorie'
                }
            });
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Récupérer un article spécifique du stock par ID (GET)
router.get('/:id', async (req, res) => {
    try {
        const stock = await Stock.findById(req.params.id).populate('article');
        if (!stock) {
            return res.status(404).json({ message: 'Stock non trouvé' });
        }
        res.json(stock);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Mettre à jour un article dans le stock (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { article, quantite, prixVente, prixAchat, fournisseur, dateAchat } = req.body;

        // Vérifier si l'article existe
        const articleExist = await Article.findById(article);
        if (!articleExist) {
            return res.status(400).json({ message: 'Article invalide' });
        }

        // Mise à jour du stock
        const stock = await Stock.findByIdAndUpdate(
            req.params.id,
            { article, quantite, prixVente, prixAchat, fournisseur, dateAchat }, // Ajout de `dateAchat`
            { new: true }
        );

        if (!stock) {
            return res.status(404).json({ message: 'Stock non trouvé' });
        }

        res.json({ message: 'Stock mis à jour avec succès', stock });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 5. Supprimer un article du stock (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const stock = await Stock.findByIdAndDelete(req.params.id);
        if (!stock) {
            return res.status(404).json({ message: 'Stock non trouvé' });
        }
        res.json({ message: 'Stock supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
