const express = require('express');
const router = express.Router();
const RendezVous = require('../models/RendezVous');
const Client = require('../models/Client');
const Devis = require('../models/Devis');
const Mecanicien = require('../models/Mecanicien');
router.get('/benefice-annuel/:annee', async (req, res) => {
    try {
        const { annee } = req.params;
        let resultats = [];

        // Récupérer tous les mécaniciens pour calculer les charges fixes (salaires)
        const mecaniciens = await Mecanicien.find();
        const salaireMensuelTotal = mecaniciens.reduce((sum, mec) => sum + mec.salaire, 0);

        for (let mois = 1; mois <= 12; mois++) {
            const debutMois = new Date(annee, mois - 1, 1);
            const finMois = new Date(annee, mois, 0, 23, 59, 59);

            // Récupérer les rendez-vous PAYÉS du mois
            const rendezVous = await RendezVous.find({
                statut: 'payé',
                createdAt: { $gte: debutMois, $lte: finMois }
            }).populate('taches.tache').populate('articlesUtilises.article');

            let totalRecettes = 0;
            let totalCoutArticlesVendues = 0;

            rendezVous.forEach(rdv => {
                rdv.taches.forEach(t => totalRecettes += t.tache.prix);
                rdv.articlesUtilises.forEach(a => {
                    totalRecettes += a.prixVente * a.quantite;
                    totalCoutArticlesVendues += a.prixAchat * a.quantite;
                });
            });

            // Calcul des charges (salaires + coût des articles vendus)
            const totalCharges = salaireMensuelTotal + totalCoutArticlesVendues;

            // Calcul du bénéfice
            const beneficeMensuel = totalRecettes - totalCharges;

            // Ajouter au tableau des résultats avec format "MM-YYYY"
            resultats.push({
                mois: `${mois.toString().padStart(2, '0')}-${annee}`, // Format "MM-YYYY"
                totalRecettes,
                totalCharges,
                beneficeMensuel
            });
        }

        res.json(resultats);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get('/benefice-mensuel/:annee/:mois', async (req, res) => {
    try {
        const { annee, mois } = req.params;

        if (mois < 1 || mois > 12) {
            return res.status(400).json({ message: "Le mois doit être entre 01 et 12" });
        }

        const debutMois = new Date(annee, mois - 1, 1);
        const finMois = new Date(annee, mois, 0, 23, 59, 59);

        // Récupérer les salaires des mécaniciens
        const mecaniciens = await Mecanicien.find();
        const totalSalaires = mecaniciens.reduce((sum, mec) => sum + mec.salaire, 0);

        // Récupérer les rendez-vous PAYÉS du mois
        const rendezVous = await RendezVous.find({
            statut: 'payé',
            createdAt: { $gte: debutMois, $lte: finMois }
        }).populate('taches.tache').populate('articlesUtilises.article');

        let totalRecettesTaches = 0;
        let totalRecettesArticles = 0;
        let totalCoutArticlesVendues = 0;

        let detailsTaches = {};
        let detailsArticles = {};

        rendezVous.forEach(rdv => {
            // Regrouper les tâches
            rdv.taches.forEach(t => {
                totalRecettesTaches += t.tache.prix;
                
                if (!detailsTaches[t.tache.description]) {
                    detailsTaches[t.tache.description] = { prix: t.tache.prix, nombre: 1 };
                } else {
                    detailsTaches[t.tache.description].nombre += 1;
                }
            });

            // Regrouper les articles par ID + prixVente + prixAchat + fournisseur
            rdv.articlesUtilises.forEach(a => {
                const key = `${a.article._id.toString()}_${a.prixVente}_${a.prixAchat}_${a.fournisseur}`;
                const coutArticle = a.prixAchat * a.quantite;
                const revenuArticle = a.prixVente * a.quantite;

                totalRecettesArticles += revenuArticle;
                totalCoutArticlesVendues += coutArticle;

                if (!detailsArticles[key]) {
                    detailsArticles[key] = {
                        article: a.article.nomArticle,
                        fournisseur: a.fournisseur,
                        quantite: a.quantite,
                        prixVenteUnitaire: a.prixVente,
                        prixAchatUnitaire: a.prixAchat,
                        totalVente: revenuArticle,
                        totalAchat: coutArticle
                    };
                } else {
                    detailsArticles[key].quantite += a.quantite;
                    detailsArticles[key].totalVente += revenuArticle;
                    detailsArticles[key].totalAchat += coutArticle;
                }
            });
        });

        const totalCharges = totalSalaires + totalCoutArticlesVendues;
        const totalRecettes = totalRecettesTaches + totalRecettesArticles;
        const beneficeMensuel = totalRecettes - totalCharges;

        res.json({
            mois: `${mois.padStart(2, '0')}-${annee}`,
            totalRecettes,
            recettes: {
                taches: {
                    total: totalRecettesTaches,
                    details: Object.entries(detailsTaches).map(([description, data]) => ({
                        description,
                        prix: data.prix,
                        nombre: data.nombre
                    }))
                },
                articles: {
                    total: totalRecettesArticles,
                    details: Object.values(detailsArticles)
                }
            },
            totalCharges,
            charges: {
                salaires: totalSalaires,
                articles: totalCoutArticlesVendues
            },
            beneficeMensuel
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
