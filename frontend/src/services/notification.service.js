import axios from 'axios';
import { API_URL } from '../config/axios.config';

class NotificationService {
  async getNotifications() {
    try {
      const response = await axios.get(`${API_URL}/notifications`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des notifications');
    }
  }

  async markAsRead(notificationId) {
    try {
      const response = await axios.put(`${API_URL}/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors du marquage de la notification');
    }
  }

  async getActivities() {
    try {
      const response = await axios.get(`${API_URL}/activities`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des activités');
    }
  }

  async createNotification(data) {
    try {
      const response = await axios.post(`${API_URL}/notifications`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de la notification');
    }
  }

  async logActivity(data) {
    try {
      const response = await axios.post(`${API_URL}/activities`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'enregistrement de l\'activité');
    }
  }
}

export const notificationService = new NotificationService();