const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    collectionName: { type: String, required: true }, // Nom de la collection qui utilise ce compteur
    sequenceValue: { type: Number, default: 0 } // Valeur du compteur
});

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
