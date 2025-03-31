const express = require('express');
const Stock = require('../models/Stock');
const Article = require('../models/Article');
const RendezVous = require('../models/RendezVous');
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

// ✅ Récupérer le total des articles dans le stock (GET)
router.get('/total-stock', async (req, res) => {
    try {
        const totalStock = await Stock.aggregate([
            {
                $group: {
                    _id: {
                        article: "$article",
                        prixVente: "$prixVente",
                        prixAchat: "$prixAchat",
                        fournisseur: "$fournisseur"
                    },
                    totalQuantite: { $sum: "$quantite" }, // Additionne les quantités
                    dernierAchat: { $max: "$dateAchat" } // Date d'achat la plus récente
                }
            },
            {
                $lookup: {
                    from: "articles", // Nom de la collection des articles
                    localField: "_id.article",
                    foreignField: "_id",
                    as: "articleDetails"
                }
            },
            { $unwind: "$articleDetails" }, // Décompose l'objet articleDetails
            {
                $project: {
                    _id: 0,
                    articleId: "$_id.article",
                    nomArticle: "$articleDetails.nomArticle",
                    prixVente: "$_id.prixVente",
                    prixAchat: "$_id.prixAchat",
                    fournisseur: "$_id.fournisseur",
                    totalQuantite: 1,
                    dernierAchat: 1
                }
            }
        ]);

        res.json(totalStock);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/total-stock-maj', async (req, res) => {
    try {
        // Récupérer tous les rendez-vous et les articles utilisés
        const rendezVous = await RendezVous.find({}).populate('articlesUtilises.article');
        
        // Récupérer le stock total avec un groupement par article, prix de vente et prix d'achat
        const totalStock = await Stock.aggregate([
            {
                $group: {
                    _id: {
                        article: "$article",        // ID de l'article
                        prixVente: "$prixVente",    // Prix de vente
                        prixAchat: "$prixAchat",    // Prix d'achat
                        fournisseur: "$fournisseur" // Fournisseur
                    },
                    totalQuantite: { $sum: "$quantite" }, // Total des quantités pour cet article, prix de vente et prix d'achat spécifiques
                    dernierAchat: { $max: "$dateAchat" }  // Date du dernier achat
                }
            },
            {
                $lookup: {
                    from: "articles",               // Joindre la collection "articles" pour récupérer les détails de l'article
                    localField: "_id.article",      // ID de l'article dans stock
                    foreignField: "_id",            // Correspondance sur l'ID de l'article dans la collection "articles"
                    as: "articleDetails"
                }
            },
            { $unwind: "$articleDetails" },  // Décomposer l'array "articleDetails" pour accéder à ses champs
            {
                $lookup: {
                    from: "categories",            // Joindre avec la collection "categories" pour récupérer les informations de la catégorie
                    localField: "articleDetails.categorie",
                    foreignField: "_id",
                    as: "categorieDetails"
                }
            },
            { $unwind: "$categorieDetails" },  // Décomposer l'array "categorieDetails"
            {
                $project: {
                    _id: 0,
                    articleId: "$_id.article",    // ID de l'article
                    article: "$articleDetails",   // Article complet avec tous les détails
                    prixVente: "$_id.prixVente",  // Prix de vente
                    prixAchat: "$_id.prixAchat",  // Prix d'achat
                    fournisseur: "$_id.fournisseur", // Fournisseur
                    totalQuantite: 1,             // Quantité totale en stock pour cette combinaison d'article, prix et fournisseur
                    dernierAchat: 1,              // Dernière date d'achat
                    categorie: {
                        _id: "$categorieDetails._id", // ID de la catégorie
                        nomCategorie: "$categorieDetails.nomCategorie", // Nom de la catégorie
                    },
                    createdAt: "$articleDetails.createdAt",
                    updatedAt: "$articleDetails.updatedAt"
                }
            }
        ]);

        // Soustraire les quantités utilisées dans les rendez-vous
        totalStock.forEach(stock => {
            let totalUsed = 0;
            rendezVous.forEach(rdv => {
                rdv.articlesUtilises.forEach(article => {
                    if (article.article._id.toString() === stock.articleId.toString() && 
                        article.prixVente === stock.prixVente && 
                        article.prixAchat === stock.prixAchat) {
                        totalUsed += article.quantite || 0;  // Ajouter la quantité utilisée
                    }
                });
            });
            // Mettre à jour la quantité restante en stock
            stock.totalQuantite -= totalUsed;
        });

        res.json(totalStock);  // Retourner le stock mis à jour avec les quantités restantes
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
