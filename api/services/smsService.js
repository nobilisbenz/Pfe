const nodemailer = require('nodemailer');

class SMSService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Convertit le numéro de téléphone au format email-to-sms pour l'Algérie
  formatPhoneNumberToEmail(phoneNumber) {
    // Nettoyer le numéro de téléphone
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    
    // Format pour l'Algérie (utilisant le gateway Mobilis)
    if (cleanNumber.startsWith('213')) {
      return `${cleanNumber}@mobilis.dz`;
    } else if (cleanNumber.startsWith('0')) {
      return `213${cleanNumber.substring(1)}@mobilis.dz`;
    }
    
    return `213${cleanNumber}@mobilis.dz`;
  }

  async sendSMS(phoneNumber, message) {
    try {
      const toEmail = this.formatPhoneNumberToEmail(phoneNumber);
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'SMS',
        text: message
      };

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du SMS:', error);
      throw new Error('Échec de l\'envoi du SMS');
    }
  }
}

module.exports = new SMSService();