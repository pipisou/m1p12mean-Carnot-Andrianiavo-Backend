const express = require('express');
const RendezVous = require('../models/RendezVous');
const Service = require('../models/Service');
const Mecanicien = require('../models/Mecanicien');
const Stock = require('../models/Stock');
const router = express.Router();

// 1. Ajouter un nouveau rendez-vous (POST)
router.post('/', async (req, res) => {
    try {
        const { client, dateHeure, heureFin, services, mecaniciens, articlesUtilises } = req.body;

        // Vérification des services
        const servicesExist = await Service.find({ '_id': { $in: services } });
        if (servicesExist.length !== services.length) {
            return res.status(400).json({ message: 'Un ou plusieurs services sont invalides' });
        }

        // Vérification des mécaniciens et des services effectués
        if (mecaniciens && mecaniciens.length > 0) {
            for (const mec of mecaniciens) {
                const mecanicienExist = await Mecanicien.findById(mec.mecanicienId);
                if (!mecanicienExist) {
                    return res.status(400).json({ message: `Le mécanicien ${mec.mecanicienId} est invalide` });
                }

                // Vérification des services effectués pour chaque mécanicien
                for (const service of mec.servicesEffectues) {
                    const serviceExist = await Service.findById(service.serviceId);
                    if (!serviceExist) {
                        return res.status(400).json({ message: `Le service ${service.serviceId} est invalide` });
                    }
                    if (!service.heureDebut || !service.heureFin) {
                        return res.status(400).json({ message: 'Chaque service effectué doit avoir une heure de début et de fin' });
                    }
                }
            }
        }

        // Vérification des articles utilisés
        if (articlesUtilises && articlesUtilises.length > 0) {
            for (const item of articlesUtilises) {
                const articleExist = await Stock.findById(item.article);
                if (!articleExist) {
                    return res.status(400).json({ message: `L'article ${item.article} est invalide` });
                }
            }
        }

        // Création du rendez-vous
        const rendezVous = new RendezVous({
            client,
            dateHeure,
            heureFin,
            services,
            mecaniciens: mecaniciens || [],
            articlesUtilises: articlesUtilises || []
        });

        await rendezVous.save();

        res.status(201).json({ message: 'Rendez-vous ajouté avec succès', rendezVous });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Récupérer tous les rendez-vous (GET)
router.get('/', async (req, res) => {
    try {
        const rendezVous = await RendezVous.find()
            .populate('client services articlesUtilises.article')
            .populate({
                path: 'mecaniciens.mecanicienId',
                model: 'Mecanicien'
            })
            .populate({
                path: 'mecaniciens.servicesEffectues.serviceId',
                model: 'Service'
            });

        res.json(rendezVous);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Récupérer un rendez-vous spécifique par ID (GET)
router.get('/:id', async (req, res) => {
    try {
        const rendezVous = await RendezVous.findById(req.params.id)
            .populate('client services articlesUtilises.article')
            .populate({
                path: 'mecaniciens.mecanicienId',
                model: 'Mecanicien'
            })
            .populate({
                path: 'mecaniciens.servicesEffectues.serviceId',
                model: 'Service'
            });

        if (!rendezVous) {
            return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }
        res.json(rendezVous);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Mettre à jour un rendez-vous (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { client, dateHeure, heureFin, services, mecaniciens, articlesUtilises } = req.body;

        // Vérification des services
        const servicesExist = await Service.find({ '_id': { $in: services } });
        if (servicesExist.length !== services.length) {
            return res.status(400).json({ message: 'Un ou plusieurs services sont invalides' });
        }

        // Vérification des mécaniciens et des services effectués
        if (mecaniciens && mecaniciens.length > 0) {
            for (const mec of mecaniciens) {
                const mecanicienExist = await Mecanicien.findById(mec.mecanicienId);
                if (!mecanicienExist) {
                    return res.status(400).json({ message: `Le mécanicien ${mec.mecanicienId} est invalide` });
                }

                // Vérification des services effectués
                for (const service of mec.servicesEffectues) {
                    const serviceExist = await Service.findById(service.serviceId);
                    if (!serviceExist) {
                        return res.status(400).json({ message: `Le service ${service.serviceId} est invalide` });
                    }
                    if (!service.heureDebut || !service.heureFin) {
                        return res.status(400).json({ message: 'Chaque service effectué doit avoir une heure de début et de fin' });
                    }
                }
            }
        }

        // Vérification des articles utilisés
        if (articlesUtilises && articlesUtilises.length > 0) {
            for (const item of articlesUtilises) {
                const articleExist = await Stock.findById(item.article);
                if (!articleExist) {
                    return res.status(400).json({ message: `L'article ${item.article} est invalide` });
                }
            }
        }

        // Mise à jour du rendez-vous
        const rendezVous = await RendezVous.findByIdAndUpdate(
            req.params.id,
            { client, dateHeure, heureFin, services, mecaniciens: mecaniciens || [], articlesUtilises: articlesUtilises || [] },
            { new: true }
        );

        if (!rendezVous) {
            return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }

        res.json({ message: 'Rendez-vous mis à jour avec succès', rendezVous });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 5. Supprimer un rendez-vous (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const rendezVous = await RendezVous.findByIdAndDelete(req.params.id);

        if (!rendezVous) {
            return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }

        res.json({ message: 'Rendez-vous supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
