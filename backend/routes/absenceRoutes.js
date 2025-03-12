const express = require('express');
const Absence = require('../models/Absence');
const Mecanicien = require('../models/Mecanicien');

const router = express.Router();

// 🔹 Ajouter une absence
router.post('/:mecanicienId', async (req, res) => {
    try {
        const { date, debut, fin } = req.body;

        const mecanicien = await Mecanicien.findById(req.params.mecanicienId);
        if (!mecanicien) return res.status(404).send('Mécanicien non trouvé');

        const absence = new Absence({ mecanicien: mecanicien._id, date, debut, fin });
        await absence.save();

        // Ajouter l'absence à la liste des absences du mécanicien
        mecanicien.absences.push(absence._id);
        await mecanicien.save();

        res.status(201).json(absence);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 🔹 Récupérer les absences d’un mécanicien
router.get('/:mecanicienId', async (req, res) => {
    try {
        const absences = await Absence.find({ mecanicien: req.params.mecanicienId });
        res.json(absences);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 🔹 Supprimer une absence par ID
router.delete('/:absenceId', async (req, res) => {
    try {
        const absence = await Absence.findById(req.params.absenceId);
        if (!absence) return res.status(404).send('Absence non trouvée');

        // Supprimer l'absence de la liste du mécanicien
        await Mecanicien.findByIdAndUpdate(absence.mecanicien, {
            $pull: { absences: absence._id }
        });

        // Supprimer l'absence elle-même
        await Absence.findByIdAndDelete(req.params.absenceId);
        res.status(201).json({ message: 'Absence supprimée' });
  
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
