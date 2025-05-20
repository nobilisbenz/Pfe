const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Base de données connectée avec succès");
  } catch (error) {
    console.error("Erreur de connexion à la base de données:", error.message);
    process.exit(1);
  }
};

module.exports = dbConnect;
