const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Mecanicien = require('../models/Mecanicien');
const router = express.Router();

// Création d'un mécanicien (POST)
router.post('/', async (req, res) => {
    try {
        const { nom, prenom, salaire, email, telephone, motDePasse, specialites, horaires } = req.body;

        // Vérification de l'existence de l'email et du téléphone
        if (await Mecanicien.findOne({ email })) return res.status(400).send('Email déjà utilisé');
        if (await Mecanicien.findOne({ telephone })) return res.status(400).send('Numéro de téléphone déjà utilisé');

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(motDePasse, 10);

        // Création d'un mécanicien
        const mecanicien = new Mecanicien({
            nom,
            prenom,
            salaire,
            email,
            telephone,
            motDePasse: hashedPassword,
            specialites,
            horaires,
            absences: []
        });

        await mecanicien.save();
        res.status(201).send('Mécanicien créé');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Récupérer tous les mécaniciens (GET)
router.get('/', async (req, res) => {
    try {
        const mecaniciens = await Mecanicien.find().populate('specialites');
        res.json(mecaniciens);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Récupérer un mécanicien par son ID (GET)
router.get('/:id', async (req, res) => {
    try {
        const mecanicien = await Mecanicien.findById(req.params.id).populate('specialites');
        if (!mecanicien) return res.status(404).send('Mécanicien non trouvé');
        res.json(mecanicien);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mise à jour d'un mécanicien (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { nom, prenom, salaire, email, telephone, motDePasse, specialites, horaires } = req.body;

        // Hachage du mot de passe si fourni
        const hashedPassword = motDePasse ? await bcrypt.hash(motDePasse, 10) : undefined;

        const mecanicien = await Mecanicien.findByIdAndUpdate(
            req.params.id,
            {
                nom,
                prenom,
                salaire,
                email,
                telephone,
                motDePasse: hashedPassword || undefined,
                specialites,
                horaires
            },
            { new: true }
        );

        if (!mecanicien) return res.status(404).send('Mécanicien non trouvé');
        res.json(mecanicien);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Suppression d'un mécanicien (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const mecanicien = await Mecanicien.findByIdAndDelete(req.params.id);
        if (!mecanicien) return res.status(404).send('Mécanicien non trouvé');
        res.send('Mécanicien supprimé');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ajouter une absence à un mécanicien (POST)
router.post('/:id/absences', async (req, res) => {
    try {
        const { date } = req.body;
        const mecanicien = await Mecanicien.findById(req.params.id);
        if (!mecanicien) return res.status(404).send('Mécanicien non trouvé');

        mecanicien.absences.push(new Date(date));
        await mecanicien.save();
        res.send('Absence ajoutée');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer une absence d'un mécanicien (DELETE)
router.delete('/:id/absences', async (req, res) => {
    try {
        const { date } = req.body;
        const mecanicien = await Mecanicien.findById(req.params.id);
        if (!mecanicien) return res.status(404).send('Mécanicien non trouvé');

        mecanicien.absences = mecanicien.absences.filter(abs => abs.toISOString().split('T')[0] !== date);
        await mecanicien.save();
        res.send('Absence supprimée');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login (POST)
router.post('/login', async (req, res) => {
    try {
        const { email, motDePasse } = req.body;

        // Recherche du mécanicien avec l'email
        const mecanicien = await Mecanicien.findOne({ email });
        if (!mecanicien) return res.status(400).send('Email ou mot de passe incorrect');

        // Vérification du mot de passe
        const isMatch = await bcrypt.compare(motDePasse, mecanicien.motDePasse);
        if (!isMatch) return res.status(400).send('Email ou mot de passe incorrect');

        // Création du token JWT
        const token = jwt.sign({ id: mecanicien._id }, 'your_secret_key', { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
