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

        // Vérifier si le client existe
        const clientExist = await Client.findById(client);
        if (!clientExist) return res.status(400).json({ message: 'Client non trouvé' });

        // Vérifier si le devis existe
        const devisExist = await Devis.findById(devis);
        if (!devisExist) return res.status(400).json({ message: 'Devis non trouvé' });

        // Créer un rendez-vous
        const rendezVous = new RendezVous({
            client,
            devis,
            dateDemande,
            statut: statut || 'en attente'
        });

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
        .populate('mecaniciens.mecanicien')
        .populate('mecaniciens.taches.tache')
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
        .populate('mecaniciens.mecanicien')
        .populate('mecaniciens.taches.tache')
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
        .populate('mecaniciens.mecanicien')
        .populate('mecaniciens.taches.tache')
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
        .populate('mecaniciens.mecanicien')
        .populate('mecaniciens.taches.tache')
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
        .populate('mecaniciens.mecanicien')
        .populate('mecaniciens.taches.tache')
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
        .populate('mecaniciens.mecanicien')
        .populate('mecaniciens.taches.tache')
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
        .populate('mecaniciens.mecanicien')
        .populate('mecaniciens.taches.tache')
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
        .populate('mecaniciens.mecanicien')
        .populate('mecaniciens.taches.tache')
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
        .populate('mecaniciens.mecanicien')
        .populate('mecaniciens.taches.tache')
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
        .populate('mecaniciens.mecanicien')
        .populate('mecaniciens.taches.tache')
        .populate('articlesUtilises.article');

        res.json(rendezVousAbsents); // Retourne le tableau (même s'il est vide)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ✅ Récupérer un rendez-vous spécifique (GET)
router.get('/:id',  async (req, res) => {
    try {
        const rendezVous = await RendezVous.findById(req.params.id)
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
        .populate('mecaniciens.mecanicien')
        .populate('mecaniciens.taches.tache')
        .populate('articlesUtilises.article');

        if (!rendezVous) return res.status(404).json({ message: 'Rendez-vous non trouvé' });

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

// ✅ Suppression d'un rendez-vous (DELETE)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const rendezVous = await RendezVous.findByIdAndDelete(req.params.id);

        if (!rendezVous) return res.status(404).json({ message: 'Rendez-vous non trouvé' });

        res.json({ message: 'Rendez-vous supprimé' });
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

module.exports = router;
