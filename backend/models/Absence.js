const mongoose = require('mongoose');

const absenceSchema = new mongoose.Schema({
    mecanicien: { type: mongoose.Schema.Types.ObjectId, ref: 'Mecanicien', required: true },
    date: { type: Date, required: true },
    debut: { type: String, required: true }, // Heure de début d'absence (ex: "08:00")
    fin: { type: String, required: true }    // Heure de fin d'absence (ex: "09:00")
}, { timestamps: true });

module.exports = mongoose.model('Absence', absenceSchema);
