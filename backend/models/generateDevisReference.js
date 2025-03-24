const Counter = require('../models/Counter'); // Assurez-vous que le chemin est correct

async function generateDevisReference() {
    try {
        // Chercher ou créer un compteur pour la collection Devis
        const counter = await Counter.findOneAndUpdate(
            { collectionName: 'Devis' },
            { $inc: { sequenceValue: 1 } }, // Incrémente la valeur du compteur
            { new: true, upsert: true } // Si le compteur n'existe pas, il est créé
        );
        
        // Générer la référence en utilisant le compteur
        const reference = `DEV-${counter.sequenceValue.toString().padStart(5, '0')}`;
        return reference; // Exemple : DEV-00001
    } catch (error) {
        throw new Error('Erreur lors de la génération de la référence de devis');
    }
}

module.exports = generateDevisReference;
