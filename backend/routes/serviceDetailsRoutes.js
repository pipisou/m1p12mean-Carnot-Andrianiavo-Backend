const express = require('express');
const ServiceDetails = require('../models/ServiceDetails');
const Service = require('../models/Service');
const CategorieDeVehicule = require('../models/CategorieDeVehicule');
const Tache = require('../models/Tache');
const { authClientMiddleware, authManagerMiddleware,authMiddleware } = require('../middlewares/authMiddleware'); // Importation des middlewares

const router = express.Router();

// ✅ Récupérer tous les détails des services (GET)
router.get('/', async (req, res) => {
    try {
        ServiceDetails.find()
            .populate('service')
            .populate('servicePrerequis')  // Populate the servicePrerequis field with the service details
            .populate('categorieDeVehicule')  // Populate the categorieDeVehicule field
            .then(serviceDetails => {
                if (serviceDetails) {
                    // Peupler les servicePrerequis en utilisant populate()
                    return ServiceDetails.populate(serviceDetails, [
                        {
                            path: 'servicePrerequis.service',  // Spécifier le champ service dans servicePrerequis
                            model: 'Service'  // Utiliser le modèle approprié pour le peuplement
                        },
                        {
                            path: 'servicePrerequis.categorieDeVehicule',  // Peupler le champ categorieDeVehicule
                            model: 'CategorieDeVehicule'  // Utiliser le modèle approprié pour le peuplement
                        }
                    ]);
                } else {
                    return serviceDetails;  // Aucun serviceDetail trouvé, on renvoie ce résultat
                }
            })
            .then(populatedServiceDetails => {
                res.json(populatedServiceDetails);  // Renvoyer les résultats avec servicePrerequis et categorieDeVehicule peuplés
            })
            .catch(error => {
                res.status(500).json({ message: 'Erreur lors du peuplement des services', error });
            });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer un service spécifique (GET)
router.get('/:id', async (req, res) => {
    try {
        const serviceDetails = await ServiceDetails.findById(req.params.id)
            .populate('service')
            .populate('categorieDeVehicule')  // Populate categorieDeVehicule
            .populate('servicePrerequis')  // Populate servicePrerequis
            .populate({
                path: 'servicePrerequis.service',  // Peupler le champ service dans servicePrerequis
                model: 'Service'
            })
            .populate({
                path: 'servicePrerequis.categorieDeVehicule',  // Peupler le champ categorieDeVehicule
                model: 'CategorieDeVehicule'
            });

        if (!serviceDetails) {
            return res.status(404).json({ message: 'ServiceDetails non trouvé' });
        }

        res.json(serviceDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Création d'un service (POST)
router.post('/', async (req, res) => {
    try {
        const { service, categorieDeVehicule, servicePrerequis } = req.body;

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
            categorieDeVehicule,
            servicePrerequis  // Le servicePrerequis est facultatif
        });

        await serviceDetails.save();
        res.status(201).json(serviceDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Mise à jour d'un service (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { service, categorieDeVehicule, servicePrerequis } = req.body;

        const updateData = {
            service,
            categorieDeVehicule,
            servicePrerequis  // Le servicePrerequis reste facultatif
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

        if (taches.length === 0) {
            return res.status(404).json({ message: 'Aucune tâche trouvée pour ce ServiceDetails' });
        }

        res.json(taches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Récupérer les ServiceDetails par catégorie de véhicule (GET)
router.get('/categorie/:categorieId', authMiddleware, async (req, res) => {
    try {
        const serviceDetails = await ServiceDetails.find({ categorieDeVehicule: req.params.categorieId })
            .populate('service')
            .populate('categorieDeVehicule')
            .populate('servicePrerequis');

        res.json(serviceDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
