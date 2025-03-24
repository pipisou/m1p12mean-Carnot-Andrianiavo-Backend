const express = require('express');
const Service = require('../models/Service');
const router = express.Router();

// Création d'un service (POST)
router.post('/', async (req, res) => {
    try {
        const { nomService, description } = req.body;

        // Vérifier si le service existe déjà
        const serviceExist = await Service.findOne({ nomService });
        if (serviceExist) return res.status(400).json({ message: 'Service déjà existant' });

        // Création du service
        const service = new Service({ nomService, description });
        await service.save();

        res.status(201).json({ message: 'Service créé avec succès', service });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mise à jour d'un service (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { nomService, description } = req.body;

        const service = await Service.findByIdAndUpdate(
            req.params.id,
            { nomService, description },
            { new: true }
        );

        if (!service) return res.status(404).json({ message: 'Service non trouvé' });
        res.json({ message: 'Service mis à jour avec succès', service });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Récupérer tous les services (GET)
router.get('/', async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Récupérer un service par son ID (GET)
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ message: 'Service non trouvé' });
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Suppression d'un service (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) return res.status(404).json({ message: 'Service non trouvé' });

        res.json({ message: 'Service supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
