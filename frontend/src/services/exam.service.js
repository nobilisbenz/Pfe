import api from '../config/axios.config';

class ExamService {
    // Récupérer tous les examens
    async getAllExams() {
        const response = await api.get('/exams');
        return response.data;
    }

    // Créer un nouvel examen
    async createExam(examData) {
        const response = await api.post('/exams', examData);
        return response.data;
    }

    // Récupérer un examen spécifique
    async getExam(examId) {
        const response = await api.get(`/exams/${examId}`);
        return response.data;
    }

    // Mettre à jour un examen
    async updateExam(examId, examData) {
        const response = await api.put(`/exams/${examId}`, examData);
        return response.data;
    }

    // Supprimer un examen
    async deleteExam(examId) {
        const response = await api.delete(`/exams/${examId}`);
        return response.data;
    }

    // Récupérer les résultats d'examen
    async getExamResults(examId) {
        const response = await api.get(`/exam-results/${examId}`);
        return response.data;
    }

    // Soumettre les résultats d'un examen
    async submitExamResults(examId, resultData) {
        const response = await api.post(`/exam-results/${examId}`, resultData);
        return response.data;
    }
}

export const examService = new ExamService();