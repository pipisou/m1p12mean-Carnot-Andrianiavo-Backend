const jwt = require('jsonwebtoken');
const Manager = require('../models/Manager'); // Le modèle Manager
const Client = require('../models/Client'); // Le modèle Client
const Mecanicien = require('../models/Mecanicien'); // Le modèle Mechanic
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
    }

    try {
        // Vérifier et décoder le token
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded; // Stocker les informations de l'utilisateur dans la requête
        next(); // Passer à la suite
    } catch (err) {
        console.error("Erreur lors de la vérification du token:", err);
        return res.status(401).json({ error: 'Token invalide ou expiré.' });
    }
};
const authClientMiddleware = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
    }

    try {
        // Décoder le token pour obtenir l'ID de l'utilisateur
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded;  // Stocker l'utilisateur dans la requête

        // Vérifier si l'ID de l'utilisateur correspond à un client dans la base de données
        const client = await Client.findById(req.user.id);
        if (!client) {
            return res.status(404).json({ error: 'Client non trouvé.' });
        }

        next(); // L'utilisateur est un client valide, passer à la suite
    } catch (err) {
        res.status(401).json({ error: 'Token invalide.' });
    }
};

const authManagerMiddleware = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
    }

    try {
        // Vérifier et décoder le token
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded; // Stocker l'utilisateur dans la requête

        // Vérifier si l'ID de l'utilisateur correspond à un manager dans la base de données
        const manager = await Manager.findById(req.user.id);
        if (!manager) {
            return res.status(404).json({ error: 'Manager non trouvé.' });
        }

        next(); // L'utilisateur est un manager valide, passer à la suite
    } catch (err) {
        console.error("Erreur lors de la vérification du token:", err);
        return res.status(401).json({ error: 'Token invalide ou expiré.' });
    }
};

const authMecanicienMiddleware = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
    }

    try {
        // Vérifier et décoder le token
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded; // Stocker l'utilisateur dans la requête

        // Vérifier si l'ID de l'utilisateur correspond à un mécanicien dans la base de données
        const mecanicien = await Mecanicien.findById(req.user.id);
        if (!mecanicien) {
            return res.status(404).json({ error: 'Mécanicien non trouvé.' });
        }

        next(); // L'utilisateur est un mécanicien valide, passer à la suite
    } catch (err) {
        console.error("Erreur lors de la vérification du token:", err);
        return res.status(401).json({ error: 'Token invalide ou expiré.' });
    }
};



module.exports = { authClientMiddleware, authManagerMiddleware, authMecanicienMiddleware, authMiddleware };
