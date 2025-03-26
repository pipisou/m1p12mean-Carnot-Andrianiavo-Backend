const express = require('express');
const Devis = require('../models/Devis');
const Client = require('../models/Client');
const ServiceDetails = require('../models/ServiceDetails');
const Tache = require('../models/Tache');
const generateDevisReference = require('../models/generateDevisReference');

const router = express.Router();

// ✅ Création d'un devis avec services uniquement (sans tâches)
router.post('/', async (req, res) => {
    try {
        const { description, client, serviceDetails } = req.body;

        if (!description || !serviceDetails || !Array.isArray(serviceDetails) || serviceDetails.length === 0) {
            return res.status(400).json({ message: 'La description et au moins un service sont requis' });
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
        }

        const referenceDevis = await generateDevisReference();

        const devis = new Devis({
            referenceDevis,
            description,
            client,
            serviceDetails: serviceDetails.map(s => ({ service: s.service, taches: [] }))
        });

        await devis.save();
        res.status(201).json({ message: 'Devis créé avec succès, ajoutez maintenant les tâches', devis });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Ajout de tâches à un service dans un devis existant
router.put('/addTaches/:devisId/:serviceId', async (req, res) => {
    try {
        const { devisId, serviceId } = req.params;
        const { taches } = req.body;

        if (!Array.isArray(taches) || taches.length === 0) {
            return res.status(400).json({ message: 'Liste de tâches requise' });
        }

        const devis = await Devis.findById(devisId);
        if (!devis) {
            return res.status(404).json({ message: 'Devis non trouvé' });
        }

        const serviceIndex = devis.serviceDetails.findIndex(s => s.service.toString() === serviceId);
        if (serviceIndex === -1) {
            return res.status(404).json({ message: 'ServiceDetails non trouvé dans ce devis' });
        }

        const tachesExistantes = await Tache.find({ _id: { $in: taches } });
        if (tachesExistantes.length !== taches.length) {
            return res.status(400).json({ message: 'Une ou plusieurs tâches sont invalides' });
        }

        devis.serviceDetails[serviceIndex].taches.push(...taches);
        await devis.save();

        res.json({ message: 'Tâches ajoutées avec succès', devis });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer tous les devis
router.get('/', async (req, res) => {
    try {
        const devis = await Devis.find()
            .populate('client')
            .populate('serviceDetails.service')
            .populate('serviceDetails.taches');
        res.json(devis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer un devis par son ID
router.get('/:id', async (req, res) => {
    try {
        const devis = await Devis.findById(req.params.id)
            .populate('client')
            .populate('serviceDetails.service')
            .populate('serviceDetails.taches');
        if (!devis) return res.status(404).json({ message: 'Devis non trouvé' });
        res.json(devis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Mise à jour d'un devis (description et services, sans tâches)
router.put('/:id', async (req, res) => {
    try {
        const { description, client, serviceDetails } = req.body;

        if (!description || !serviceDetails || !Array.isArray(serviceDetails) || serviceDetails.length === 0) {
            return res.status(400).json({ message: 'La description et au moins un service sont requis' });
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
        }

        const devis = await Devis.findByIdAndUpdate(
            req.params.id,
            { description, client, serviceDetails: serviceDetails.map(s => ({ service: s.service, taches: [] })) },
            { new: true }
        )
        .populate('client')
        .populate('serviceDetails.service')
        .populate('serviceDetails.taches');

        if (!devis) return res.status(404).json({ message: 'Devis non trouvé' });

        res.json(devis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Suppression d'un devis
router.delete('/:id', async (req, res) => {
    try {
        const devis = await Devis.findByIdAndDelete(req.params.id);
        if (!devis) return res.status(404).json({ message: 'Devis non trouvé' });
        res.json({ message: 'Devis supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
