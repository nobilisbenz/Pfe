import api from '../config/axios.config';

class MessagingService {
  async sendSMS(userId, message) {
    try {
      const response = await api.post('/notifications/sms/send', {
        userId,
        message
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'envoi du SMS');
    }
  }

  async sendBulkSMS(userIds, message) {
    try {
      const response = await api.post('/notifications/sms/send-bulk', {
        userIds,
        message
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'envoi des SMS');
    }
  }
}

export const messagingService = new MessagingService();