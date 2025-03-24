const express = require('express');
const Devis = require('../models/Devis');
const Client = require('../models/Client');
const ServiceDetails = require('../models/ServiceDetails');
const Tache = require('../models/Tache');
const generateDevisReference = require('../models/generateDevisReference');

const router = express.Router();

// ✅ Création d'un devis (POST)
router.post('/', async (req, res) => {
    try {
        const { description, client, serviceDetails } = req.body;

        if (!description || !serviceDetails || !Array.isArray(serviceDetails) || serviceDetails.length === 0) {
            return res.status(400).json({ message: 'La description et au moins un serviceDetails sont requis' });
        }

        if (client) {
            const clientExist = await Client.findById(client);
            if (!clientExist) {
                return res.status(400).json({ message: 'Client non valide' });
            }
        }

        // Vérification des services et tâches associées
        for (const service of serviceDetails) {
            const serviceExist = await ServiceDetails.findById(service.service);
            if (!serviceExist) {
                return res.status(400).json({ message: `ServiceDetails non valide pour l'ID ${service.service}` });
            }

            const tachesExist = await Tache.find({ _id: { $in: service.taches } });
            if (tachesExist.length !== service.taches.length) {
                return res.status(400).json({ message: `Une ou plusieurs tâches sont invalides pour le service ${service.service}` });
            }
        }

        const referenceDevis = await generateDevisReference();

        const devis = new Devis({
            referenceDevis,
            description,
            client,
            serviceDetails,
        });

        await devis.save();
        res.status(201).json({ message: 'Devis créé avec succès', devis });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer tous les devis (GET)
router.get('/', async (req, res) => {
    try {
        const devis = await Devis.find()
            .populate('client')
            .populate({
                path: 'serviceDetails.service',
                model: 'ServiceDetails'
            })
            .populate({
                path: 'serviceDetails.taches',
                model: 'Tache'
            });

        res.json(devis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer un devis par son ID (GET)
router.get('/:id', async (req, res) => {
    try {
        const devis = await Devis.findById(req.params.id)
            .populate('client')
            .populate({
                path: 'serviceDetails.service',
                model: 'ServiceDetails'
            })
            .populate({
                path: 'serviceDetails.taches',
                model: 'Tache'
            });

        if (!devis) {
            return res.status(404).json({ message: 'Devis non trouvé' });
        }

        res.json(devis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Mise à jour d'un devis (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { description, client, serviceDetails } = req.body;

        if (!description || !serviceDetails || !Array.isArray(serviceDetails) || serviceDetails.length === 0) {
            return res.status(400).json({ message: 'La description et au moins un serviceDetails sont requis' });
        }

        if (client) {
            const clientExist = await Client.findById(client);
            if (!clientExist) {
                return res.status(400).json({ message: 'Client non valide' });
            }
        }

        for (const service of serviceDetails) {
            const serviceExist = await ServiceDetails.findById(service.service);
            if (!serviceExist) {
                return res.status(400).json({ message: `ServiceDetails non valide pour l'ID ${service.service}` });
            }

            const tachesExist = await Tache.find({ _id: { $in: service.taches } });
            if (tachesExist.length !== service.taches.length) {
                return res.status(400).json({ message: `Une ou plusieurs tâches sont invalides pour le service ${service.service}` });
            }
        }

        const devis = await Devis.findByIdAndUpdate(
            req.params.id,
            { description, client, serviceDetails },
            { new: true }
        )
        .populate('client')
        .populate({
            path: 'serviceDetails.service',
            model: 'ServiceDetails'
        })
        .populate({
            path: 'serviceDetails.taches',
            model: 'Tache'
        });

        if (!devis) return res.status(404).json({ message: 'Devis non trouvé' });

        res.json(devis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Suppression d'un devis (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const devis = await Devis.findByIdAndDelete(req.params.id);
        if (!devis) {
            return res.status(404).json({ message: 'Devis non trouvé' });
        }
        res.json({ message: 'Devis supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer tous les devis sans client pour un serviceDetails donné
router.get('/getalldevisServicedetails/:id', async (req, res) => {
    try {
        const serviceDetailsId = req.params.id;

        const devis = await Devis.find({
            'serviceDetails.service': serviceDetailsId,
            client: null
        })
        .populate({
            path: 'serviceDetails.service',
            model: 'ServiceDetails'
        })
        .populate({
            path: 'serviceDetails.taches',
            model: 'Tache'
        });

        if (devis.length === 0) {
            return res.status(404).json({ message: 'Aucun devis trouvé pour ce serviceDetails sans client' });
        }

        res.json(devis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
