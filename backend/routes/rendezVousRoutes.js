const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit'); // Assure-toi d'importer pdfkit
const RendezVous = require('../models/RendezVous');
const Client = require('../models/Client');
const Devis = require('../models/Devis');
const Mecanicien = require('../models/Mecanicien');
const Stock = require('../models/Stock');
const Article = require('../models/Article');
const PdfPrinter = require('pdfmake'); // Assurez-vous d'avoir installé pdfmake
const vfsFonts = require('pdfmake/build/vfs_fonts');
const { authMiddleware, authClientMiddleware,authMecanicienMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// ✅ Création d'un rendez-vous (POST)
router.post('/', async (req, res) => {
    try {
        const { client, devis, dateDemande, statut } = req.body;

        // Vérifier si le client et le devis existent
        const [clientExist, devisExist] = await Promise.all([
            Client.findById(client),
            Devis.findById(devis)
        ]);

        if (!clientExist) return res.status(400).json({ message: 'Client non trouvé' });
        if (!devisExist) return res.status(400).json({ message: 'Devis non trouvé' });

        // Créer un rendez-vous
        const rendezVous = new RendezVous({ client, devis, dateDemande, statut: statut || 'en attente' });
        await rendezVous.save();

        res.status(201).json({ message: 'Rendez-vous créé', rendezVous });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer tous les rendez-vous (GET) - Protégé par authMiddleware
router.get('/', authMiddleware, async (req, res) => {
    try {
        const rendezVous = await RendezVous.find()
        .populate('client')
        .populate({
            path: 'devis',
            populate: [
                { path: 'taches' },   // Peupler les tâches du devis
                { 
                    path: 'vehicule',
                    populate: { path: 'categorie' }  // Peupler la catégorie du véhicule
                }
            ]
        })
        .populate('taches.tache')
        .populate('taches.mecanicien')
        .populate('articlesUtilises.article');

        res.json(rendezVous);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer tous les rendez-vous en attente (GET)
router.get('/en-attente', async (req, res) => {
    try {
        const rendezVousEnAttente = await RendezVous.find({ statut: 'en attente' })
        .populate('client')
        .populate({
            path: 'devis',
            populate: [
                { path: 'taches' },   // Peupler les tâches du devis
                { 
                    path: 'vehicule',
                    populate: { path: 'categorie' }  // Peupler la catégorie du véhicule
                }
            ]
        })
        .populate('taches.tache')
        .populate('taches.mecanicien')
        .populate('articlesUtilises.article');

        res.json(rendezVousEnAttente);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer tous les rendez-vous validés (GET)
router.get('/valides', async (req, res) => {
    try {
        const rendezVousValides = await RendezVous.find({ statut: 'validé' })
        .populate('client')
        .populate({
            path: 'devis',
            populate: [
                { path: 'taches' },   // Peupler les tâches du devis
                { 
                    path: 'vehicule',
                    populate: { path: 'categorie' }  // Peupler la catégorie du véhicule
                }
            ]
        })
        .populate('taches.tache')
        .populate('taches.mecanicien')
        .populate('articlesUtilises.article');

        res.json(rendezVousValides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer tous les rendez-vous marqués comme "Présent" (GET)
router.get('/present', async (req, res) => {
    try {
        const rendezVousPresents = await RendezVous.find({ statut: 'présent' })
        .populate('client')
        .populate({
            path: 'devis',
            populate: [
                { path: 'taches' },
                { 
                    path: 'vehicule',
                    populate: { path: 'categorie' }
                }
            ]
        })
        .populate('taches.tache')
        .populate('taches.mecanicien')
        .populate('articlesUtilises.article');

        res.json(rendezVousPresents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer tous les rendez-vous marqués comme "Absent" (GET)
router.get('/absent', async (req, res) => {
    try {
        const rendezVousAbsents = await RendezVous.find({ statut: 'absent' })
        .populate('client')
        .populate({
            path: 'devis',
            populate: [
                { path: 'taches' },
                { 
                    path: 'vehicule',
                    populate: { path: 'categorie' }
                }
            ]
        })
        .populate('taches.tache')
        .populate('taches.mecanicien')
        .populate('articlesUtilises.article');

        res.json(rendezVousAbsents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// ✅ Récupérer tous les rendez-vous marqués comme "Payer" (GET)
router.get('/payer', async (req, res) => {
    try {
        const rendezVousPresents = await RendezVous.find({ statut: 'payé' })
        .populate('client')
        .populate({
            path: 'devis',
            populate: [
                { path: 'taches' },
                { 
                    path: 'vehicule',
                    populate: { path: 'categorie' }
                }
            ]
        })
        .populate('taches.tache')
        .populate('taches.mecanicien')
        .populate('articlesUtilises.article');

        res.json(rendezVousPresents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ✅ Récupérer tous les rendez-vous d'un client (GET) - Protégé par authClientMiddleware
router.get('/client', authClientMiddleware, async (req, res) => {
    try {
        const clientId = req.user.id;  // Récupère l'ID du client depuis le token

        const rendezVous = await RendezVous.find({ client: clientId })
        .populate('client')
        .populate({
            path: 'devis',
            populate: [
                { path: 'taches' },
                { 
                    path: 'vehicule',
                    populate: { path: 'categorie' }
                }
            ]
        })
        .populate('taches.tache')
        .populate('taches.mecanicien')
        .populate('articlesUtilises.article');

        res.json(rendezVous); // Retourne le tableau (même s'il est vide)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ✅ Récupérer les rendez-vous en attente d'un client (GET)
router.get('/client/en-attente', authClientMiddleware, async (req, res) => {
    try {
        const clientId = req.user.id;  // Récupère l'ID du client depuis le token

        const rendezVousEnAttente = await RendezVous.find({ client: clientId, statut: 'en attente' })
        .populate('client')
        .populate({
            path: 'devis',
            populate: [
                { path: 'taches' },   // Peupler les tâches du devis
                { 
                    path: 'vehicule',
                    populate: { path: 'categorie' }  // Peupler la catégorie du véhicule
                }
            ]
        })
        .populate('taches.tache')
        .populate('taches.mecanicien')
        .populate('articlesUtilises.article');
        res.json(rendezVousEnAttente); // Retourne le tableau (même s'il est vide)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer les rendez-vous validés d'un client (GET)
router.get('/client/valides', authClientMiddleware, async (req, res) => {
    try {
        const clientId = req.user.id;  // Récupère l'ID du client depuis le token

        const rendezVousValidés = await RendezVous.find({ client: clientId, statut: 'validé' }) // Attention à la casse "validé" au lieu de "Validé"
        .populate('client')
        .populate({
            path: 'devis',
            populate: [
                { path: 'taches' },   // Peupler les tâches du devis
                { 
                    path: 'vehicule',
                    populate: { path: 'categorie' }  // Peupler la catégorie du véhicule
                }
            ]
        })
        .populate('taches.tache')
        .populate('taches.mecanicien')
        .populate('articlesUtilises.article');

        res.json(rendezVousValidés); // Retourne le tableau (même s'il est vide)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// ✅ Récupérer les rendez-vous "Présent" d'un client (GET) - Protégé par authClientMiddleware
router.get('/client/present', authClientMiddleware, async (req, res) => {
    try {
        const clientId = req.user.id;  // Récupère l'ID du client depuis le token

        const rendezVousPresents = await RendezVous.find({ client: clientId, statut: 'présent' })
        .populate('client')
        .populate({
            path: 'devis',
            populate: [
                { path: 'taches' },
                { 
                    path: 'vehicule',
                    populate: { path: 'categorie' }
                }
            ]
        })
        .populate('taches.tache')
        .populate('taches.mecanicien')
        .populate('articlesUtilises.article');

        res.json(rendezVousPresents); // Retourne le tableau (même s'il est vide)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer les rendez-vous "Absent" d'un client (GET) - Protégé par authClientMiddleware
router.get('/client/absent', authClientMiddleware, async (req, res) => {
    try {
        const clientId = req.user.id;  // Récupère l'ID du client depuis le token

        const rendezVousAbsents = await RendezVous.find({ client: clientId, statut: 'absent' })
        .populate('client')
        .populate({
            path: 'devis',
            populate: [
                { path: 'taches' },
                { 
                    path: 'vehicule',
                    populate: { path: 'categorie' }
                }
            ]
        })
        .populate('taches.tache')
        .populate('taches.mecanicien')
        .populate('articlesUtilises.article');

        res.json(rendezVousAbsents); // Retourne le tableau (même s'il est vide)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ✅ Récupérer un rendez-vous spécifique (GET)
router.get('/:id', async (req, res) => {
    try {
        const rendezVous = await RendezVous.findById(req.params.id)
            .populate('client')
            .populate({
                path: 'devis',
                populate: [
                    { path: 'taches' }, // Peupler les tâches du devis
                    {
                        path: 'vehicule',
                        populate: { path: 'categorie' } // Peupler la catégorie du véhicule
                    }
                ]
            })
            .populate('taches.tache')
            .populate('taches.mecanicien')
            .populate('articlesUtilises.article');

        if (!rendezVous) return res.status(404).json({ message: 'Rendez-vous non trouvé' });

        // Trier les tâches par 'dateHeureDebut' dans l'ordre croissant
        if (rendezVous.taches && Array.isArray(rendezVous.taches)) {
            rendezVous.taches.sort((a, b) => {
                const dateA = new Date(a.dateHeureDebut);
                const dateB = new Date(b.dateHeureDebut);
                return dateA - dateB; // Tri croissant
            });
        }

        res.json(rendezVous);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ✅ Mise à jour d'un rendez-vous (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { client, devis, dateDemande, statut, dateChoisie, mecaniciens } = req.body;

        // Vérifier si le client existe
        const clientExist = await Client.findById(client);
        if (!clientExist) return res.status(400).json({ message: 'Client non trouvé' });

        // Vérifier si le devis existe
        const devisExist = await Devis.findById(devis);
        if (!devisExist) return res.status(400).json({ message: 'Devis non trouvé' });

        // Mettre à jour le rendez-vous
        const rendezVous = await RendezVous.findByIdAndUpdate(
            req.params.id,
            { client, devis, dateDemande, statut, dateChoisie, mecaniciens },
            { new: true }
        );

        if (!rendezVous) return res.status(404).json({ message: 'Rendez-vous non trouvé' });

        res.json(rendezVous);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// ✅ Mise à jour de la date choisie et validation du rendez-vous (PUT)
router.put('/valider/:id', async (req, res) => {
    try {
        const { dateChoisie } = req.body;

        if (!dateChoisie) {
            return res.status(400).json({ message: 'La date choisie est requise' });
        }

        // Met à jour uniquement la date choisie et le statut du rendez-vous
        const rendezVous = await RendezVous.findByIdAndUpdate(
            req.params.id,
            { dateChoisie, statut: 'validé' },
            { new: true }
        );

        if (!rendezVous) {
            return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }

        res.json(rendezVous);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ✅ Suppression d'un rendez-vous et du devis associé (DELETE)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        // Récupérer le rendez-vous
        const rendezVous = await RendezVous.findById(req.params.id).populate('devis');

        if (!rendezVous) return res.status(404).json({ message: 'Rendez-vous non trouvé' });

        // Supprimer le devis associé
        const devis = rendezVous.devis;
        if (devis) {
            await Devis.findByIdAndDelete(devis._id);
        }

        // Supprimer le rendez-vous
        await rendezVous.deleteOne(); // Remplacer remove() par deleteOne()

        res.json({ message: 'Rendez-vous et devis supprimés' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ✅ Mise à jour du statut d'un rendez-vous (PUT)
router.put('/:id/statut', async (req, res) => {
    try {
        const { statut } = req.body;

        // Vérifier si le statut est valide
        const validStatuts = ['en attente', 'présent', 'absent', 'payé'];
        if (!validStatuts.includes(statut)) {
            return res.status(400).json({ message: 'Statut invalide' });
        }

        // Mettre à jour le statut du rendez-vous
        const rendezVous = await RendezVous.findByIdAndUpdate(
            req.params.id,
            { statut },
            { new: true }
        );

        if (!rendezVous) return res.status(404).json({ message: 'Rendez-vous non trouvé' });

        res.json({ message: 'Statut mis à jour', rendezVous });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Mise à jour d'une plage de dates demandée et passage du rendez-vous en attente
router.put('/rendezvous/:id/modifier-dates', authClientMiddleware, async (req, res) => { 
    try {
        const { dateDemande } = req.body;

        // Vérifie que la demande est bien un tableau et qu'il n'est pas vide
        if (!Array.isArray(dateDemande) || dateDemande.length === 0) {
            return res.status(400).json({ message: 'Une plage de dates est requise' });
        }

        // Vérifie la validité des dates dans le tableau
        for (const date of dateDemande) {
            if (!date.dateHeureDebut || !date.dateHeureFin || 
                isNaN(new Date(date.dateHeureDebut).getTime()) || 
                isNaN(new Date(date.dateHeureFin).getTime())) {
                return res.status(400).json({ message: 'Les dates de la plage demandée sont invalides' });
            }
        }

        // Mise à jour du rendez-vous avec la nouvelle plage de dates, statut "EN ATTENTE" et dateChoisie à null
        const rendezVous = await RendezVous.findByIdAndUpdate(
            req.params.id,
            { 
                dateDemande, 
                statut: 'en attente', 
                dateChoisie: null // Ajout de la mise à jour de dateChoisie
            }, 
            { new: true }
        );

        if (!rendezVous) {
            return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }

        res.json({ message: 'Plage de dates mise à jour avec succès', rendezVous });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
router.put('/rendezvous/:id/taches', async (req, res) => {
    console.log(req.body);
    try {
        const { taches, articlesUtilises } = req.body;

        // Vérification de la validité des données des tâches
        if (!taches || !Array.isArray(taches)) {
            return res.status(400).json({ message: "Liste des tâches invalide." });
        }

        // Récupérer le rendez-vous par ID
        const rendezVous = await RendezVous.findById(req.params.id);
        if (!rendezVous) {
            return res.status(404).json({ message: "Rendez-vous non trouvé." });
        }

        // Mise à jour des tâches
        rendezVous.taches.forEach(tache => {
            const updatedTache = taches.find(t => t.tacheId.toString() === tache._id.toString());
            if (updatedTache) {
                if (updatedTache.mecanicien) tache.mecanicien = updatedTache.mecanicien;
                if (updatedTache.dateHeureDebut) tache.dateHeureDebut = updatedTache.dateHeureDebut;
                if (updatedTache.dateHeureFin) tache.dateHeureFin = updatedTache.dateHeureFin;
            }
        });

        // Regroupement des articles avant ajout
        if (Array.isArray(articlesUtilises)) {
            // Créer un objet pour regrouper les articles par leur clé unique
            const articlesRegroupes = {};

            for (const updatedArticle of articlesUtilises) {
                if (!updatedArticle.article) {
                    console.warn("Article sans ID détecté :", updatedArticle);
                    continue; // Ignore cet article et passe au suivant
                }

                // Vérifier si l'article a tous les champs requis
                if (!updatedArticle.prixVente || !updatedArticle.prixAchat || !updatedArticle.fournisseur) {
                    console.warn("Article incomplet détecté :", updatedArticle);
                    continue; // Ignore cet article et passe au suivant
                }

                // Vérification de la validité des champs numériques
                if (isNaN(updatedArticle.prixVente) || isNaN(updatedArticle.prixAchat) || isNaN(updatedArticle.quantite)) {
                    console.warn("Prix ou quantité invalide pour l'article :", updatedArticle);
                    continue; // Ignore cet article et passe au suivant
                }

                // Créer une clé unique pour regrouper les articles : {ID, prixVente, prixAchat, fournisseur}
                const key = `${updatedArticle.article._id}_${updatedArticle.prixVente}_${updatedArticle.prixAchat}_${updatedArticle.fournisseur}`;

                // Si l'article existe déjà dans le regroupement, on cumule la quantité
                if (articlesRegroupes[key]) {
                    articlesRegroupes[key].quantite += updatedArticle.quantite;
                } else {
                    // Sinon, on l'ajoute au regroupement
                    articlesRegroupes[key] = {
                        article: updatedArticle.article,
                        prixVente: updatedArticle.prixVente,
                        prixAchat: updatedArticle.prixAchat,
                        fournisseur: updatedArticle.fournisseur,
                        quantite: updatedArticle.quantite
                    };
                }
            }

            // Maintenant, on va ajouter ces articles regroupés à `rendezVous.articlesUtilises`
            rendezVous.articlesUtilises = []; // Réinitialiser les articles existants

            for (const key in articlesRegroupes) {
                const articleData = articlesRegroupes[key];

                // Récupérer les détails de l'article depuis la collection Article
                const articleDetails = await Article.findById(articleData.article._id);
                if (!articleDetails) {
                    return res.status(400).json({ message: `Article avec ID ${articleData.article._id} introuvable.` });
                }

                // Ajouter l'article regroupé au rendez-vous
                rendezVous.articlesUtilises.push({
                    article: articleDetails._id,
                    quantite: articleData.quantite,
                    prixVente: articleData.prixVente || articleDetails.prixVente,
                    prixAchat: articleData.prixAchat || articleDetails.prixAchat,
                    fournisseur: articleData.fournisseur || articleDetails.fournisseur
                });
            }
        }

        // Sauvegarder les modifications
        await rendezVous.save();

        res.status(200).json({ message: "Tâches et articles mis à jour avec succès", rendezVous });

    } catch (error) {
        console.error("Erreur lors de la mise à jour des tâches et articles :", error);
        res.status(500).json({ message: "Erreur serveur", error });
    }
});




// ✅ Mise à jour du statut de la tâche avec vérification du mécanicien (PATCH)
router.patch('/changesatuts/:id', authMecanicienMiddleware, async (req, res) => {
    try {
        const { tacheId, newStatus } = req.body;
        
        if (!['en attente', 'en cours', 'terminée'].includes(newStatus)) {
            return res.status(400).json({ message: 'Statut invalide. Utilisez "en attente", "en cours" ou "terminée".' });
        }

        // Trouver le rendez-vous contenant la tâche
        const rendezVous = await RendezVous.findOne({ _id: req.params.id, 'taches.tache': tacheId });

        if (!rendezVous) {
            return res.status(404).json({ message: 'Rendez-vous ou tâche non trouvée.' });
        }

        // Trouver la tâche spécifique
        const tache = rendezVous.taches.find(t => t.tache.toString() === tacheId);

        // Vérification que le mécanicien correspond
        if (tache.mecanicien.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier cette tâche.' });
        }

        // Mise à jour du statut de la tâche
        tache.statut = newStatus;
        await rendezVous.save();  // Sauvegarde des modifications du rendez-vous

        res.json({ message: 'Statut de la tâche mis à jour avec succès.', rendezVous });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
const fonts = {
    Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    }
};

const printer = new PdfPrinter(fonts);

router.get('/facture/:id', async (req, res) => {
    try {
        const rendezVous = await RendezVous.findById(req.params.id)
            .populate('client')
            .populate({
                path: 'devis',
                populate: [
                    { path: 'taches', populate: { path: 'serviceDetails', populate: { path: 'service' } } },
                    { path: 'vehicule', populate: { path: 'categorie' } }
                ]
            })
            .populate({
                path: 'taches',
                populate: { path: 'tache', populate: { path: 'serviceDetails', populate: { path: 'service' } } }
            })
            .populate('articlesUtilises.article');

        if (!rendezVous) {
            return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }

        let total = 0;

        const docDefinition = {
            content: [
                { text: 'Facture', fontSize: 20, alignment: 'center', bold: true },
                { text: `Client: ${rendezVous.client.nom}`, fontSize: 12 },
                { text: `Référence du devis: ${rendezVous.devis.referenceDevis}`, fontSize: 12 },
                rendezVous.devis.vehicule ? { text: `Véhicule: ${rendezVous.devis.vehicule.immatriculation}`, fontSize: 12 } : {},
                { text: 'Tâches effectuées:', fontSize: 14, bold: true, margin: [0, 20] },
                {
                    style: 'tableExample',
                    table: {
                        widths: ['40%', '30%', '30%'], // Ajuste les proportions des colonnes
                        body: [
                            [{ text: 'Description', bold: true }, { text: 'Service', bold: true, alignment: 'center' }, { text: 'Prix', bold: true, alignment: 'right' }],
                            ...rendezVous.taches.map(t => {
                                total += t.tache.prix;
                                return [
                                    t.tache.description,
                                    { text: t.tache.serviceDetails.service.nomService, alignment: 'center' },
                                    { text: `${t.tache.prix}€`, alignment: 'right' }
                                ];
                            })
                        ]
                    },
                    layout: 'noBorders' // Supprime toutes les bordures
                },
                { text: 'Articles utilisés:', fontSize: 14, bold: true, margin: [0, 20] },
                {
                    style: 'tableExample',
                    table: {
                        widths: ['40%', '30%', '30%'],
                        body: [
                            [{ text: 'Article', bold: true }, { text: 'Quantité x Prix', bold: true, alignment: 'center' }, { text: 'Total', bold: true, alignment: 'right' }],
                            ...rendezVous.articlesUtilises.map(a => {
                                const articleTotal = a.quantite * a.prixVente;
                                total += articleTotal;
                                return [
                                    a.article.nomArticle,
                                    { text: `${a.quantite} x ${a.prixVente}€`, alignment: 'center' },
                                    { text: `${articleTotal}€`, alignment: 'right' }
                                ];
                            })
                        ]
                    },
                    layout: 'noBorders' // Supprime toutes les bordures
                },
                { text: `Total à payer: ${total}€`, alignment: 'right', fontSize: 16, margin: [0, 20] },
                { text: `Total dû: ${rendezVous.statut === 'payé' ? '0 €' : `${total}€`}`, alignment: 'right', fontSize: 16 }
            ],
            styles: {
                tableExample: {
                    margin: [0, 5, 0, 15],
                    fontSize: 10
                }
            },
            defaultStyle: {
                font: 'Helvetica'
            }
        };
        

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=facture.pdf');
        pdfDoc.pipe(res);
        pdfDoc.end();

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
function formatDateWithoutTimezone(date) {
    // Vérifie si la date est au format ISO 8601 avec fuseau horaire
    const isoDate = new Date(date);
    // Retourne au format "YYYY-MM-DDTHH:mm"
    return isoDate.toISOString().slice(0, 16);
}
module.exports = router;
