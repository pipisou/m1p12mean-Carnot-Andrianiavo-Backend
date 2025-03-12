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

        // Création d'un nouvel horaire
        const horaire = new Horaire({ mecanicien: mecanicien._id, joursTravail });
        await horaire.save();

        // Mise à jour du champ `horaire` du mécanicien avec le nouvel ID
        mecanicien.horaire = horaire._id;
        await mecanicien.save();

        res.send('Horaire mis à jour');
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
