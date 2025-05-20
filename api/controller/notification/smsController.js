const AysncHandler = require("express-async-handler");
const twilio = require('twilio');

// Configuration du client Twilio avec journalisation
let client;
try {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  console.log('Twilio client initialisé avec succès');
} catch (error) {
  console.error('Erreur d\'initialisation Twilio:', error);
}

const getFormattedPhone = (phoneNumber) => {
  // Nettoyage du numéro
  const cleaned = phoneNumber.replace(/\D/g, '');
  console.log('Numéro nettoyé:', cleaned);
  
  // S'assurer que le numéro commence par +213
  let formatted;
  if (cleaned.startsWith('213')) {
    formatted = '+' + cleaned;
  } else if (cleaned.startsWith('0')) {
    formatted = '+213' + cleaned.substring(1);
  } else {
    formatted = '+213' + cleaned;
  }
  
  console.log('Numéro formaté:', formatted);
  return formatted;
};

// @desc    Send SMS to single user
// @route   POST /api/v1/notifications/sms/send
// @access  Private Admin
exports.sendSMS = AysncHandler(async (req, res) => {
  const { userId, message } = req.body;
  console.log('Début de sendSMS - userId:', userId, 'message:', message);

  if (!userId || !message) {
    return res.status(400).json({
      status: "error",
      message: "UserId et message sont requis",
    });
  }

  try {
    // Recherche de l'utilisateur
    const User = require("../../model/Academic/Student");
    const Teacher = require("../../model/Staff/Teacher");
    const Admin = require("../../model/Staff/Admin");

    let user = await User.findById(userId) ||
               await Teacher.findById(userId) ||
               await Admin.findById(userId);

    console.log('Utilisateur trouvé:', user);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Utilisateur non trouvé",
      });
    }

    if (!user.phone) {
      return res.status(400).json({
        status: "error",
        message: "L'utilisateur n'a pas de numéro de téléphone",
      });
    }

    const formattedPhone = getFormattedPhone(user.phone);
    console.log('Envoi SMS à:', formattedPhone);

    // Vérification des identifiants Twilio
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.error('Configuration Twilio manquante');
      return res.status(500).json({
        status: "error",
        message: "Configuration du service SMS incomplète"
      });
    }

    // Envoi du SMS via Twilio
    console.log('Configuration Twilio:', {
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    const twilioMessage = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log('Réponse Twilio:', twilioMessage);

    res.status(200).json({
      status: "success",
      message: "SMS envoyé avec succès",
      data: {
        messageId: twilioMessage.sid,
        status: twilioMessage.status
      }
    });
  } catch (error) {
    console.error("Erreur détaillée d'envoi SMS:", {
      message: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
      status: error.status,
      details: error
    });

    let errorMessage = "Erreur lors de l'envoi du SMS";
    if (error.code) {
      switch (error.code) {
        case 20003:
          errorMessage = "Numéro de téléphone non valide";
          break;
        case 20404:
          errorMessage = "Le numéro de téléphone n'est pas un numéro mobile valide";
          break;
        case 21211:
          errorMessage = "Identifiants Twilio invalides";
          break;
        case 21606:
          errorMessage = "Le numéro de téléphone n'est pas vérifié";
          break;
        case 21614:
          errorMessage = "Numéro de téléphone invalide pour la région";
          break;
        default:
          errorMessage = `Erreur lors de l'envoi du SMS: ${error.message}`;
      }
    }

    res.status(500).json({
      status: "error",
      message: errorMessage,
      details: error.code ? `Code d'erreur: ${error.code}` : error.message
    });
  }
});

// @desc    Send SMS to multiple users
// @route   POST /api/v1/notifications/sms/send-bulk
// @access  Private Admin
exports.sendBulkSMS = AysncHandler(async (req, res) => {
  const { userIds, message } = req.body;
  console.log('Début de sendBulkSMS - userIds:', userIds, 'message:', message);

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !message) {
    return res.status(400).json({
      status: "error",
      message: "Liste d'utilisateurs et message sont requis",
    });
  }

  try {
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    // Modèles d'utilisateurs
    const User = require("../../model/Academic/Student");
    const Teacher = require("../../model/Staff/Teacher");
    const Admin = require("../../model/Staff/Admin");

    for (const userId of userIds) {
      try {
        let user = await User.findById(userId) ||
                   await Teacher.findById(userId) ||
                   await Admin.findById(userId);

        if (!user || !user.phone) {
          results.failed++;
          results.errors.push(`Utilisateur ${userId}: Numéro non trouvé`);
          continue;
        }

        const formattedPhone = getFormattedPhone(user.phone);
        console.log(`Envoi SMS à ${user._id}:`, formattedPhone);

        // Envoi du SMS via Twilio
        const twilioMessage = await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone
        });

        console.log('Réponse Twilio pour', user._id, ':', twilioMessage.status);
        results.success++;
      } catch (error) {
        console.error(`Erreur pour l'utilisateur ${userId}:`, error);
        results.failed++;
        results.errors.push(`Utilisateur ${userId}: ${error.message}`);
      }
    }

    res.status(200).json({
      status: "success",
      message: "Envoi des SMS terminé",
      data: results,
    });
  } catch (error) {
    console.error("Erreur d'envoi SMS en masse:", error);
    res.status(500).json({
      status: "error",
      message: "Erreur lors de l'envoi des SMS",
      details: error.message
    });
  }
});