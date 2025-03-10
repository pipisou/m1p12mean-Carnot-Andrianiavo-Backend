const express = require('express');
const Article = require('../models/Article');
const Categorie = require('../models/Categorie');  // Assurez-vous d'avoir le modèle Specialite
const router = express.Router();

// 1. Ajouter un nouvel article (POST)
router.post('/', async (req, res) => {
    try {
        const { nomArticle, categorie } = req.body;

        // Vérification si la spécialité existe
        const categorieExist = await Categorie.findById(categorie);
        if (!categorieExist) {
            return res.status(400).json({ message: 'categorie invalide' });
        }

        // Création de l'article
        const article = new Article({ nomArticle, categorie });
        await article.save();

        res.status(201).json({ message: 'Article ajouté avec succès', article });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Récupérer tous les articles (GET)
router.get('/', async (req, res) => {
    try {
        const articles = await Article.find().populate('categorie');
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Récupérer un article spécifique par ID (GET)
router.get('/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate('categorie');
        if (!article) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Mettre à jour un article (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { nomArticle, categorie } = req.body;

        // Vérification si la spécialité existe
        const categorieExist = await Categorie.findById(categorie);
        if (!categorieExist) {
            return res.status(400).json({ message: 'Categorie invalide' });
        }

        // Mise à jour de l'article
        const article = await Article.findByIdAndUpdate(
            req.params.id,
            { nomArticle, categorie },
            { new: true }
        );

        if (!article) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }

        res.json({ message: 'Article mis à jour avec succès', article });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 5. Supprimer un article (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);

        if (!article) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }

        res.json({ message: 'Article supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 6. Récupérer tous les articles d'une catégorie spécifique (GET)
router.get('/categorie/:categorieId', async (req, res) => {
    try {
        const { categorieId } = req.params;

        // Vérification si la catégorie existe
        const categorieExist = await Categorie.findById(categorieId);
        if (!categorieExist) {
            return res.status(400).json({ message: 'Catégorie invalide' });
        }

        // Récupérer tous les articles de la catégorie spécifiée
        const articles = await Article.find({ categorie: categorieId }).populate('categorie');

        if (articles.length === 0) {
            return res.status(404).json({ message: 'Aucun article trouvé pour cette catégorie' });
        }

        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
