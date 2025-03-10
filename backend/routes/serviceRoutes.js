const express = require('express');
const Service = require('../models/Service');
const Specialite = require('../models/Specialite');
const router = express.Router();

// Création d'un service (POST)
router.post('/', async (req, res) => {
    try {
        const { nomService, description, specialites, prix, tempsEstime } = req.body;

        // Vérifier si les spécialités existent dans la base de données
        const specialitesExistantes = await Specialite.find({ 
            _id: { $in: specialites }  // Recherche les spécialités en fonction des ObjectId passés
        });

        if (specialitesExistantes.length !== specialites.length) {
            return res.status(400).json({ message: 'Une ou plusieurs spécialités ne sont pas valides.' });
        }

        // Vérifier si le service existe déjà
        const serviceExist = await Service.findOne({ nomService });
        if (serviceExist) return res.status(400).send('Service déjà existant');

        // Création du service
        const service = new Service({
            nomService,
            description,
            specialites,
            prix,
            tempsEstime
        });

        await service.save();
        res.status(201).send('Service créé');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Récupérer tous les services (GET)
router.get('/', async (req, res) => {
    try {
        const services = await Service.find().populate('specialites'); // Pour remplir les spécialités avec leurs détails
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Récupérer un service par son ID (GET)
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate('specialites');
        if (!service) return res.status(404).send('Service non trouvé');
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mise à jour d'un service (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { nomService, description, specialites, prix, tempsEstime } = req.body;

        // Vérifier si les spécialités existent dans la base de données
        const specialitesExistantes = await Specialite.find({
            _id: { $in: specialites }
        });

        if (specialitesExistantes.length !== specialites.length) {
            return res.status(400).json({ message: 'Une ou plusieurs spécialités ne sont pas valides.' });
        }

        const service = await Service.findByIdAndUpdate(
            req.params.id,
            {
                nomService,
                description,
                specialites,
                prix,
                tempsEstime
            },
            { new: true }
        );

        if (!service) return res.status(404).send('Service non trouvé');
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Suppression d'un service (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) return res.status(404).send('Service non trouvé');
        res.send('Service supprimé');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
