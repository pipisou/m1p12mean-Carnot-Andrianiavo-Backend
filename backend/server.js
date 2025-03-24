const express = require('express'); 
const mongoose = require('mongoose'); 
const cors = require('cors'); 
require('dotenv').config(); 
const app = express(); 
const PORT = process.env.PORT || 5000; 
// Middleware 
app.use(cors()); 
app.use(express.json()); 
// Connexion à MongoDB 
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connecté à MongoDB Atlas');
}).catch(err => {
  console.error('❌ Erreur de connexion à MongoDB:', err);
});

   // Routes 
   app.get('/', (req, res) => {
    res.send('ping');
  });
  
app.use('/client', require('./routes/clientRoutes')); 
app.use('/manager', require('./routes/managerRoutes'));
app.use('/mecanicien', require('./routes/mecanicienRoutes')); 
app.use('/specialite', require('./routes/specialiteRoutes'));
app.use('/categorie', require('./routes/categorieRoutes'));
app.use('/service', require('./routes/serviceRoutes'));
app.use('/article', require('./routes/articleRoutes'));
app.use('/stock', require('./routes/stockRoutes'));
app.use('/rendezVous', require('./routes/rendezVousRoutes'));
app.use('/devis', require('./routes/devisRoutes'));
app.use('/taches', require('./routes/tacheRoutes'));
app.use('/vehicule', require('./routes/vehiculeRoutes'));
app.use('/horaire', require('./routes/horaireRoutes'));
app.use('/absence', require('./routes/absenceRoutes'));
app.use('/categorieDeVehicule', require('./routes/categorieDeVehiculeRoutes'));
app.use('/service-details', require('./routes/serviceDetailsRoutes'));

app.listen(PORT, () => console.log(`Serveur démarré sur le port 
${PORT}`));