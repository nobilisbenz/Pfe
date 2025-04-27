require("dotenv").config();
const http = require("http");
const { dbConnect } = require("./config/dbConnect");
const app = require("./app/app");
const PORT = process.env.PORT || 5000;

// Connexion à la base de données
dbConnect().catch(err => {
    console.error('Erreur de connexion à la base de données:', err);
    process.exit(1);
});


// Configuration du serveur
const server = http.createServer(app);

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
    console.error('Erreur non capturée:', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('Promesse rejetée non gérée:', err);
    process.exit(1);
});

// Démarrage du serveur
server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
});
