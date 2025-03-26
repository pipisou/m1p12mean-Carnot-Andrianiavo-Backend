const express = require('express');
const mongoose = require('mongoose');
const RendezVous = require('../models/RendezVous');
const Client = require('../models/Client');
const Devis = require('../models/Devis');
const Mecanicien = require('../models/Mecanicien');
const Stock = require('../models/Stock');
const { authMiddleware,authClientMiddleware} = require('../middlewares/authMiddleware');

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

        // Créer un rendez-vous avec un statut initial "en attente"
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
            .populate('devis')
            .populate('mecaniciens.mecanicien')
            .populate('mecaniciens.services.service')
            .populate('articlesUtilises.article');

        res.json(rendezVous);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer un rendez-vous spécifique par son ID (GET) - Protégé par authMiddleware
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const rendezVous = await RendezVous.findById(req.params.id)
            .populate('client')
            .populate('devis')
            .populate('mecaniciens.mecanicien')
            .populate('mecaniciens.services.service')
            .populate('articlesUtilises.article');

        if (!rendezVous) return res.status(404).json({ message: 'Rendez-vous non trouvé' });

        res.json(rendezVous);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Mise à jour d'un rendez-vous (PUT) - Protégé par authMiddleware
router.put('/:id', authMiddleware, async (req, res) => {
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

// ✅ Suppression d'un rendez-vous (DELETE) - Protégé par authMiddleware
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const rendezVous = await RendezVous.findByIdAndDelete(req.params.id);

        if (!rendezVous) return res.status(404).json({ message: 'Rendez-vous non trouvé' });

        res.json({ message: 'Rendez-vous supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Mise à jour du statut d'un rendez-vous (PUT) - Protégé par authMiddleware
router.put('/:id/statut', authMiddleware, async (req, res) => {
    try {
        const { statut } = req.body;

        // Vérifier si le statut est valide
        const validStatuts = ['en attente', 'validé', 'en cours', 'terminée', 'payé', 'reprogrammé intervalle', 'reprogrammé dateChoisie'];
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

// ✅ Mise à jour de la date choisie par le manager (PUT) - Protégé par authMiddleware
router.put('/:id/dateChoisie', authMiddleware, async (req, res) => {
    try {
        const { dateChoisie } = req.body;

        // Vérifier si la date est valide
        if (!dateChoisie || isNaN(new Date(dateChoisie).getTime())) {
            return res.status(400).json({ message: 'Date invalide' });
        }

        // Mettre à jour la date choisie du rendez-vous
        const rendezVous = await RendezVous.findByIdAndUpdate(
            req.params.id,
            { dateChoisie },
            { new: true }
        );

        if (!rendezVous) return res.status(404).json({ message: 'Rendez-vous non trouvé' });

        res.json({ message: 'Date choisie mise à jour', rendezVous });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
