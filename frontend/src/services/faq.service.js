import api from '../config/axios.config';

class FaqService {
    async getAllFAQs() {
        try {
            const response = await api.get('/faqs');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des FAQs');
        }
    }

    async getFAQ(id) {
        try {
            const response = await api.get(`/faqs/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de la FAQ');
        }
    }

    async createFAQ(faqData) {
        try {
            const response = await api.post('/faqs', faqData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Erreur lors de la création de la FAQ');
        }
    }

    async updateFAQ(id, faqData) {
        try {
            const response = await api.put(`/faqs/${id}`, faqData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de la FAQ');
        }
    }

    async deleteFAQ(id) {
        try {
            const response = await api.delete(`/faqs/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de la FAQ');
        }
    }
}

export const faqService = new FaqService();