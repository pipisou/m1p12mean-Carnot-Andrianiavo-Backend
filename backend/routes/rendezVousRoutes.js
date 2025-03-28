const express = require('express');
const mongoose = require('mongoose');
const RendezVous = require('../models/RendezVous');
const Client = require('../models/Client');
const Devis = require('../models/Devis');
const Mecanicien = require('../models/Mecanicien');
const Stock = require('../models/Stock');
const { authMiddleware, authClientMiddleware } = require('../middlewares/authMiddleware');

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
// Mettre à jour uniquement les champs mecanicien, dateHeureDebut et dateHeureFin dans les tâches

router.put('/rendezvous/:id/taches', async (req, res) => {
    try {
        const { taches } = req.body;

        if (!taches || !Array.isArray(taches)) {
            return res.status(400).json({ message: "Liste des tâches invalide." });
        }

        // Mise à jour des tâches spécifiques du rendez-vous
        const rendezVous = await RendezVous.findById(req.params.id);
        if (!rendezVous) {
            return res.status(404).json({ message: "Rendez-vous non trouvé." });
        }

        rendezVous.taches.forEach(tache => {
            const updatedTache = taches.find(t => t.tacheId.toString() === tache._id.toString());
            if (updatedTache) {
                if (updatedTache.mecanicien) tache.mecanicien = updatedTache.mecanicien;
                if (updatedTache.dateHeureDebut) tache.dateHeureDebut = updatedTache.dateHeureDebut;
                if (updatedTache.dateHeureFin) tache.dateHeureFin = updatedTache.dateHeureFin;
            }
        });

        await rendezVous.save();
        res.status(200).json({ message: "Tâches mises à jour avec succès", rendezVous });

    } catch (error) {
        console.error("Erreur lors de la mise à jour des tâches :", error);
        res.status(500).json({ message: "Erreur serveur", error });
    }
});


module.exports = router;
