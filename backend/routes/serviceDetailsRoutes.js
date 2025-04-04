const express = require('express');
const ServiceDetails = require('../models/ServiceDetails');
const Service = require('../models/Service');
const CategorieDeVehicule = require('../models/CategorieDeVehicule');
const Tache = require('../models/Tache');
const { authClientMiddleware, authManagerMiddleware, authMiddleware } = require('../middlewares/authMiddleware'); // Importation des middlewares

const router = express.Router();
// ✅ Création d'un service (POST)
router.post('/', async (req, res) => {
    try {
        const { service, categorieDeVehicule } = req.body;

        // Vérifier si le service avec la catégorie de véhicule existe déjà
        const existingServiceDetails = await ServiceDetails.findOne({
            service,
            categorieDeVehicule
        });

        if (existingServiceDetails) {
            return res.status(400).json({ message: 'Ce service avec cette catégorie de véhicule existe déjà.' });
        }

        // Si le service n'existe pas, créer un nouveau ServiceDetails
        const serviceDetails = new ServiceDetails({
            service,
            categorieDeVehicule
        });

        await serviceDetails.save();
        res.status(201).json(serviceDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// ✅ Récupérer tous les détails des services (GET)
router.get('/', async (req, res) => {
    try {
        const serviceDetails = await ServiceDetails.find()
            .populate('service')
            .populate('categorieDeVehicule');

        res.json(serviceDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer un service spécifique (GET)
router.get('/:id', async (req, res) => {
    try {
        const serviceDetails = await ServiceDetails.findById(req.params.id)
            .populate('service')
            .populate('categorieDeVehicule');

        if (!serviceDetails) {
            return res.status(404).json({ message: 'ServiceDetails non trouvé' });
        }

        res.json(serviceDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// ✅ Mise à jour d'un service (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { service, categorieDeVehicule } = req.body;

        const updateData = {
            service,
            categorieDeVehicule
        };

        const serviceDetails = await ServiceDetails.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!serviceDetails) return res.status(404).json({ message: 'Détails du service non trouvés' });

        res.json(serviceDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Suppression d'un service (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const serviceDetails = await ServiceDetails.findByIdAndDelete(req.params.id);
        if (!serviceDetails) {
            return res.status(404).json({ message: 'Détails du service non trouvés' });
        }
        res.json({ message: 'Détails du service supprimés avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer toutes les tâches d'un ServiceDetails spécifique (GET)
router.get('/alltaches/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Rechercher toutes les tâches associées à ce ServiceDetails
        const taches = await Tache.find({ serviceDetails: id })
            .populate('serviceDetails')  // Peupler les détails du service
            .populate('articlesNecessaires.article');  // Peupler les articles nécessaires

        // Retourner un tableau vide si aucune tâche n'est trouvée
        res.json(taches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ✅ Récupérer les ServiceDetails par catégorie de véhicule (GET)
router.get('/categorie/:categorieId',  async (req, res) => {
    console.log(req.params.categorieId);
    try {
        const serviceDetails = await ServiceDetails.find({ categorieDeVehicule: req.params.categorieId })
            .populate('service')
            .populate('categorieDeVehicule');

        res.json(serviceDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
