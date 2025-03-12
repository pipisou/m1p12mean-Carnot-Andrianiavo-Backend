const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded; // Stocker l'utilisateur dans req.user
        next(); // Passer à la prochaine fonction
    } catch (err) {
        res.status(401).json({ error: 'Token invalide.' });
    }
};

module.exports = authMiddleware;
