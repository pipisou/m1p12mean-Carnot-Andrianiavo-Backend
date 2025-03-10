const express = require('express');
const router = express.Router();
const Manager = require('../models/Manager');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Inscription (Créer un manager)
router.post('/register', async (req, res) => {
    try {
        const { nom, email, motDePasse } = req.body;

        // Vérifier si l'email existe déjà
        const existingManager = await Manager.findOne({ email });
        if (existingManager) {
            return res.status(400).json({ error: "Email déjà utilisé" });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(motDePasse, 10);

        // Créer le manager
        const newManager = new Manager({ nom, email, motDePasse: hashedPassword });
        await newManager.save();

        res.status(201).json({ message: "Compte Manager créé avec succès", manager: newManager });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Connexion
router.post('/login', async (req, res) => {
    try {
        const { email, motDePasse } = req.body;

        // Vérifier si le manager existe
        const manager = await Manager.findOne({ email });
        if (!manager) {
            return res.status(400).json({ error: "Email ou mot de passe incorrect" });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(motDePasse, manager.motDePasse);
        if (!isMatch) {
            return res.status(400).json({ error: "Email ou mot de passe incorrect" });
        }

        // Générer un token JWT
        const token = jwt.sign({ id: manager._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Connexion réussie", token, manager });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Récupérer tous les managers
router.get('/', async (req, res) => {
    try {
        const managers = await Manager.find();
        res.json(managers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Récupérer un manager par ID
router.get('/:id', async (req, res) => {
    try {
        const manager = await Manager.findById(req.params.id);
        if (!manager) return res.status(404).json({ error: "Manager non trouvé" });

        res.json(manager);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Modifier un manager
router.put('/:id', async (req, res) => {
    try {
        const { nom, email, motDePasse } = req.body;

        // Vérifier si le manager existe
        let manager = await Manager.findById(req.params.id);
        if (!manager) return res.status(404).json({ error: "Manager non trouvé" });

        // Hacher le nouveau mot de passe si fourni
        const hashedPassword = motDePasse ? await bcrypt.hash(motDePasse, 10) : manager.motDePasse;

        // Mise à jour
        manager = await Manager.findByIdAndUpdate(
            req.params.id,
            { nom, email, motDePasse: hashedPassword },
            { new: true }
        );

        res.json({ message: "Manager mis à jour", manager });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Supprimer un manager
router.delete('/:id', async (req, res) => {
    try {
        const manager = await Manager.findById(req.params.id);
        if (!manager) return res.status(404).json({ error: "Manager non trouvé" });

        await Manager.findByIdAndDelete(req.params.id);
        res.json({ message: "Manager supprimé" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
