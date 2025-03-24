const express = require('express');
const Tache = require('../models/Tache');  
const ServiceDetails = require('../models/ServiceDetails');
const Article = require('../models/Article');

const router = express.Router();
// ✅ Création d'une tâche (POST)
router.post('/', async (req, res) => {
    try {
        const { serviceDetailsId, description, prix, tempsEstime, marge, articlesNecessaires } = req.body;
        
        // Vérification du serviceDetails
        const serviceDetails = await ServiceDetails.findById(serviceDetailsId);
        if (!serviceDetails) return res.status(404).json({ message: 'Détails du service non trouvés' });

        // Vérification si une tâche avec la même description existe déjà pour ce serviceDetailsId
        const existingTache = await Tache.findOne({ 
            serviceDetails: serviceDetailsId, 
            description: description 
        });
        
        if (existingTache) {
            return res.status(400).json({ message: 'Une tâche avec cette description existe déjà pour ce service.' });
        }

        // Vérification des articles nécessaires
        const verifiedArticles = await Promise.all(articlesNecessaires.map(async (article) => {
            const articleFound = await Article.findById(article.article);
            if (!articleFound) throw new Error(`Article avec ID ${article.article} introuvable`);
            return { article: article.article, quantite: article.quantite };
        }));

        // Création de la tâche
        const tache = new Tache({
            serviceDetails: serviceDetailsId,
            description,
            prix,
            tempsEstime,
            marge,
            articlesNecessaires: verifiedArticles
        });

        await tache.save();
        res.status(201).json({ message: 'Tâche créée', tache });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer toutes les tâches (GET)
router.get('/', async (req, res) => {
    try {
        const taches = await Tache.find()
            .populate('serviceDetails')
            .populate('articlesNecessaires.article');
        res.json(taches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer une tâche spécifique (GET)
router.get('/:id', async (req, res) => {
    try {
        const tache = await Tache.findById(req.params.id)
            .populate('serviceDetails')
            .populate('articlesNecessaires.article');

        if (!tache) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        res.json(tache);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Création d'une tâche (POST)
router.post('/', async (req, res) => {
    try {
        const { serviceDetailsId, description, prix, tempsEstime, marge, articlesNecessaires } = req.body;
        
        // Vérification du serviceDetails
        const serviceDetails = await ServiceDetails.findById(serviceDetailsId);
        if (!serviceDetails) return res.status(404).json({ message: 'Détails du service non trouvés' });

        // Vérification des articles nécessaires
        const verifiedArticles = await Promise.all(articlesNecessaires.map(async (article) => {
            const articleFound = await Article.findById(article.article);
            if (!articleFound) throw new Error(`Article avec ID ${article.article} introuvable`);
            return { article: article.article, quantite: article.quantite };
        }));

        // Création de la tâche
        const tache = new Tache({
            serviceDetails: serviceDetailsId,
            description,
            prix,
            tempsEstime,
            marge,
            articlesNecessaires: verifiedArticles
        });

        await tache.save();
        res.status(201).json({ message: 'Tâche créée', tache });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Mise à jour d'une tâche (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { description, prix, tempsEstime, marge, articlesNecessaires } = req.body;

        // Vérification des articles nécessaires
        const verifiedArticles = await Promise.all(articlesNecessaires.map(async (article) => {
            const articleFound = await Article.findById(article.article);
            if (!articleFound) throw new Error(`Article avec ID ${article.article} introuvable`);
            return { article: article.article, quantite: article.quantite };
        }));

        const updateData = {
            description,
            prix,
            tempsEstime,
            marge,
            articlesNecessaires: verifiedArticles
        };

        const tache = await Tache.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!tache) return res.status(404).json({ message: 'Tâche non trouvée' });
        res.json(tache);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Suppression d'une tâche (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const tache = await Tache.findByIdAndDelete(req.params.id);
        if (!tache) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        res.json({ message: 'Tâche supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});




module.exports = router;
