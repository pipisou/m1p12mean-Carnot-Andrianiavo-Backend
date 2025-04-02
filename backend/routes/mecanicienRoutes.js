const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Mecanicien = require('../models/Mecanicien');
const { authClientMiddleware, authManagerMiddleware, authMecanicienMiddleware} = require('../middlewares/authMiddleware'); // Importation des middlewares
const router = express.Router();

// 🔹 Création d'un mécanicien
router.post('/', async (req, res) => {
    try {
        const { nom, prenom, salaire, email, telephone, motDePasse, services } = req.body;

        if (await Mecanicien.findOne({ email })) return res.status(400).send('Email déjà utilisé');
        if (await Mecanicien.findOne({ telephone })) return res.status(400).send('Numéro de téléphone déjà utilisé');

        const hashedPassword = await bcrypt.hash(motDePasse, 10);

        const mecanicien = new Mecanicien({
            nom,
            prenom,
            salaire,
            email,
            telephone,
            motDePasse: hashedPassword,
            services,
            absences: []
        });

        await mecanicien.save();
        res.status(201).json({ message: 'Mécanicien créé avec succès' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 🔹 Récupérer tous les mécaniciens
router.get('/', async (req, res) => {
    try {
        const mecaniciens = await Mecanicien.find()
            .populate('services')  // Récupérer les services
            .populate({
                path: 'horaire',
                options: { 
                    sort: { createdAt: -1 },
                    limit: 1
                }
            }).populate('absences');

        res.json(mecaniciens);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route de connexion - Pas besoin de token
router.post('/login', async (req, res) => {
    try {
        const { email, motDePasse } = req.body;

        // Vérifier si le mécanicien existe
        const mecanicien = await Mecanicien.findOne({ email });
        if (!mecanicien) {
            return res.status(400).json({ error: "Email ou mot de passe incorrect" });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(motDePasse, mecanicien.motDePasse);
        if (!isMatch) {
            return res.status(400).json({ error: "Email ou mot de passe incorrect" });
        }

        // Générer un token JWT
        const token = jwt.sign({ id: mecanicien._id }, process.env.JWT_SECRET, { expiresIn: "8h" });

        res.json({ message: "Connexion réussie", token, mecanicien });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route protégée - Nécessite un token mécanicien
router.get('/me', authMecanicienMiddleware, async (req, res) => {
    try {
        const mecanicien = await Mecanicien.findById(req.user.id).select('-motDePasse'); // Exclure le mot de passe
        if (!mecanicien) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        res.json(mecanicien);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 🔹 Récupérer un mécanicien par ID avec le dernier horaire
router.get('/:id', async (req, res) => {
    try {
        const mecanicien = await Mecanicien.findById(req.params.id)
            .populate('services')  // Peupler les services
            .populate({
                path: 'horaire',
                options: {
                    sort: { createdAt: -1 },
                    limit: 1
                }
            }).populate('absences');

        if (!mecanicien) return res.status(404).send('Mécanicien non trouvé');

        res.json(mecanicien);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 🔹 Mise à jour d'un mécanicien
router.put('/:id', async (req, res) => {
    try {
        const { nom, prenom, salaire, email, telephone, motDePasse, services } = req.body;
        console.log('Données reçues:', req.body);
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
                services
            },
            { new: true, runValidators: true }
        );

        if (!mecanicien) return res.status(404).send('Mécanicien non trouvé');
        res.json(mecanicien);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 🔹 Suppression d'un mécanicien
router.delete('/:id', async (req, res) => {
    try {
        const mecanicien = await Mecanicien.findByIdAndDelete(req.params.id);
        if (!mecanicien) return res.status(404).send('Mécanicien non trouvé');

        res.status(200).json({ message: 'Mécanicien supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
