const express = require('express');
const Horaire = require('../models/Horaire');
const Mecanicien = require('../models/Mecanicien');

const router = express.Router();

// 🔹 Ajouter ou mettre à jour l'horaire d'un mécanicien
router.post('/:mecanicienId', async (req, res) => {
    try {
        const { joursTravail } = req.body;
        const mecanicien = await Mecanicien.findById(req.params.mecanicienId);
        if (!mecanicien) return res.status(404).send('Mécanicien non trouvé');

        // Validation des heures de pause
        for (const jour of joursTravail) {
            if (jour.pause && jour.pause.debut && jour.pause.fin) {
                if (jour.pause.debut < jour.debut || jour.pause.fin > jour.fin) {
                    return res.status(400).json({
                        message: `La pause du ${jour.jour} doit être comprise entre ${jour.debut} et ${jour.fin}.`
                    });
                }
                if (jour.pause.debut >= jour.pause.fin) {
                    return res.status(400).json({
                        message: `L'heure de début de la pause doit être avant l'heure de fin pour ${jour.jour}.`
                    });
                }
            }
        }

        // Création d'un nouvel horaire
        const horaire = new Horaire({ mecanicien: mecanicien._id, joursTravail });
        await horaire.save();

        // Mise à jour du champ `horaire` du mécanicien avec le nouvel ID
        mecanicien.horaire = horaire._id;
        await mecanicien.save();
        res.json({ message:'Horaire mis à jour'});
    
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 🔹 Récupérer l’horaire actuel d’un mécanicien
router.get('/:mecanicienId', async (req, res) => {
    try {
        const mecanicien = await Mecanicien.findById(req.params.mecanicienId).populate('horaire');
        if (!mecanicien) return res.status(404).send('Mécanicien non trouvé');

        res.json(mecanicien.horaire);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
