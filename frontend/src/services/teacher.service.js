import api from '../config/axios.config';

class TeacherService {
    // Récupérer tous les enseignants
    async getAllTeachers() {
        const response = await api.get('/teachers/admin');
        return response.data;
    }

    // Récupérer un enseignant spécifique
    async getTeacher(teacherId) {
        const response = await api.get(`/teachers/admin/${teacherId}`);
        return response.data;
    }

    // Mettre à jour un enseignant
    async updateTeacher(teacherId, teacherData) {
        const response = await api.put(`/teachers/admin/${teacherId}`, teacherData);
        return response.data;
    }

    // Récupérer le profil de l'enseignant connecté
    async getTeacherProfile() {
        const response = await api.get('/teachers/profile');
        return response.data;
    }

    // Mettre à jour le profil de l'enseignant
    async updateTeacherProfile(profileData) {
        const response = await api.put('/teachers/profile', profileData);
        return response.data;
    }

    // Récupérer les classes d'un enseignant
    async getTeacherClasses(teacherId) {
        const response = await api.get(`/teachers/${teacherId}/classes`);
        return response.data;
    }

    // Gérer le statut d'un enseignant (suspension, retrait)
    async updateTeacherStatus(teacherId, status) {
        const response = await api.put(`/teachers/${teacherId}/status`, { status });
        return response.data;
    }
}

export const teacherService = new TeacherService();