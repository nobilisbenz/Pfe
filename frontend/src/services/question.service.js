import api from '../config/axios.config';

class QuestionService {
    // Récupérer toutes les questions d'un examen
    async getQuestions(examId) {
        const response = await api.get(`/questions/${examId}`);
        return response.data;
    }

    // Créer une nouvelle question
    async createQuestion(examId, questionData) {
        const response = await api.post(`/questions/${examId}`, questionData);
        return response.data;
    }

    // Mettre à jour une question
    async updateQuestion(questionId, questionData) {
        const response = await api.put(`/questions/${questionId}`, questionData);
        return response.data;
    }

    // Supprimer une question
    async deleteQuestion(questionId) {
        const response = await api.delete(`/questions/${questionId}`);
        return response.data;
    }

    // Récupérer une question spécifique
    async getQuestion(questionId) {
        const response = await api.get(`/questions/single/${questionId}`);
        return response.data;
    }
}

export const questionService = new QuestionService();