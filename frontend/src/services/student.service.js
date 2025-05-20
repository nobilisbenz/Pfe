import api from '../config/axios.config';

class StudentService {
    // Récupérer tous les étudiants
    async getAllStudents() {
        const response = await api.get('/students/admin');
        return response.data;
    }

    // Récupérer un étudiant spécifique
    async getStudent(studentId) {
        const response = await api.get(`/students/admin/${studentId}`);
        return response.data;
    }

    // Mettre à jour un étudiant
    async updateStudent(studentId, studentData) {
        const response = await api.put(`/students/admin/${studentId}`, studentData);
        return response.data;
    }

    // Récupérer le profil de l'étudiant connecté
    async getStudentProfile() {
        const response = await api.get('/students/profile');
        return response.data;
    }

    // Mettre à jour le profil de l'étudiant
    async updateStudentProfile(profileData) {
        const response = await api.put('/students/profile', profileData);
        return response.data;
    }

    // Récupérer les résultats d'examens d'un étudiant
    async getStudentExamResults(studentId) {
        const response = await api.get(`/students/${studentId}/exam-results`);
        return response.data;
    }
}

export const studentService = new StudentService();