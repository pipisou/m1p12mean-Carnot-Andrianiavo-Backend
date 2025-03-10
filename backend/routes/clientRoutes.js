const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Inscription (Créer un client)
router.post('/register', async (req, res) => {
    try {
        const { nom, prenom, email, telephone, motDePasse } = req.body;

        // Vérifier si l'email ou le téléphone existe déjà
        const existingClient = await Client.findOne({ $or: [{ email }, { telephone }] });
        if (existingClient) {
            return res.status(400).json({ error: "Email ou téléphone déjà utilisé" });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(motDePasse, 10);

        // Créer le client
        const newClient = new Client({ nom, prenom, email, telephone, motDePasse: hashedPassword });
        await newClient.save();

        res.status(201).json({ message: "Compte créé avec succès", client: newClient });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Connexion
router.post('/login', async (req, res) => {
    try {
        const { email, motDePasse } = req.body;

        // Vérifier si le client existe
        const client = await Client.findOne({ email });
        if (!client) {
            return res.status(400).json({ error: "Email ou mot de passe incorrect" });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(motDePasse, client.motDePasse);
        if (!isMatch) {
            return res.status(400).json({ error: "Email ou mot de passe incorrect" });
        }

        // Générer un token JWT
        const token = jwt.sign({ id: client._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Connexion réussie", token, client });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Récupérer tous les clients
router.get('/', async (req, res) => {
    try {
        const clients = await Client.find();
        res.json(clients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Récupérer un client par ID
router.get('/:id', async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) return res.status(404).json({ error: "Client non trouvé" });

        res.json(client);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Modifier un client
router.put('/:id', async (req, res) => {
    try {
        const { nom, prenom, email, telephone, motDePasse } = req.body;

        // Vérifier si le client existe
        let client = await Client.findById(req.params.id);
        if (!client) return res.status(404).json({ error: "Client non trouvé" });

        // Hacher le nouveau mot de passe si fourni
        const hashedPassword = motDePasse ? await bcrypt.hash(motDePasse, 10) : client.motDePasse;

        // Mise à jour
        client = await Client.findByIdAndUpdate(
            req.params.id,
            { nom, prenom, email, telephone, motDePasse: hashedPassword },
            { new: true }
        );

        res.json({ message: "Client mis à jour", client });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Supprimer un client
router.delete('/:id', async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) return res.status(404).json({ error: "Client non trouvé" });

        await Client.findByIdAndDelete(req.params.id);
        res.json({ message: "Client supprimé" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
