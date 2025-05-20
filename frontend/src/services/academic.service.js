import api from '../config/axios.config';

class AcademicService {
    // Programmes
    async getPrograms() {
        try {
            const response = await api.get('/programs');
            if (response?.data?.status === "success") {
                return response.data;
            }
            throw new Error(response?.data?.message || "Erreur lors du chargement des programmes");
        } catch (error) {
            throw new Error(error?.response?.data?.message || error.message || "Erreur lors du chargement des programmes");
        }
    }

    async createProgram(data) {
        // S'assurer que les dates sont au bon format
        if (data.schedule?.startDate) {
            data.schedule.startDate = new Date(data.schedule.startDate).toISOString();
        }
        if (data.schedule?.endDate) {
            data.schedule.endDate = new Date(data.schedule.endDate).toISOString();
        }
        const response = await api.post('/programs', data);
        return response.data;
    }

    async updateProgram(id, data) {
        // S'assurer que les dates sont au bon format
        if (data.schedule?.startDate) {
            data.schedule.startDate = new Date(data.schedule.startDate).toISOString();
        }
        if (data.schedule?.endDate) {
            data.schedule.endDate = new Date(data.schedule.endDate).toISOString();
        }
        const response = await api.put(`/programs/${id}`, data);
        return response.data;
    }

    async updateProgramSchedule(id, scheduleData) {
        const response = await api.put(`/programs/${id}/schedule`, scheduleData);
        return response.data;
    }

    async deleteProgram(id) {
        const response = await api.delete(`/programs/${id}`);
        return response.data;
    }

    async addSubjectToProgram(programId, subjectId) {
        const response = await api.put(`/programs/${programId}/subjects`, { subjectId });
        return response.data;
    }

    // Matières
    async getSubjects() {
        try {
            const response = await api.get('/subjects');
            if (response?.data?.status === "success") {
                return response.data;
            }
            throw new Error(response?.data?.message || "Erreur lors du chargement des matières");
        } catch (error) {
            throw new Error(error?.response?.data?.message || error.message || "Erreur lors du chargement des matières");
        }
    }

    async createSubject(programId, data) {
        const response = await api.post(`/subjects/${programId}`, data);
        return response.data;
    }

    async updateSubject(id, data) {
        const response = await api.put(`/subjects/${id}`, data);
        return response.data;
    }

    async deleteSubject(id) {
        const response = await api.delete(`/subjects/${id}`);
        return response.data;
    }

    // Années académiques
    async getAcademicYears() {
        try {
            const response = await api.get('/academic-years');
            if (response?.data?.status === "success") {
                return response.data;
            }
            throw new Error(response?.data?.message || "Erreur lors du chargement des années académiques");
        } catch (error) {
            throw new Error(error?.response?.data?.message || error.message || "Erreur lors du chargement des années académiques");
        }
    }

    async createAcademicYear(data) {
        const response = await api.post('/academic-years', data);
        return response.data;
    }

    async updateAcademicYear(id, data) {
        const response = await api.put(`/academic-years/${id}`, data);
        return response.data;
    }

    async deleteAcademicYear(id) {
        const response = await api.delete(`/academic-years/${id}`);
        return response.data;
    }

    // Semestres académiques
    async getAcademicTerms() {
        try {
            const response = await api.get('/academic-terms');
            if (response?.data?.status === "success") {
                return response.data;
            }
            throw new Error(response?.data?.message || "Erreur lors du chargement des semestres");
        } catch (error) {
            throw new Error(error?.response?.data?.message || error.message || "Erreur lors du chargement des semestres");
        }
    }

    async createAcademicTerm(data) {
        const response = await api.post('/academic-terms', data);
        return response.data;
    }

    async updateAcademicTerm(id, data) {
        const response = await api.put(`/academic-terms/${id}`, data);
        return response.data;
    }

    async deleteAcademicTerm(id) {
        const response = await api.delete(`/academic-terms/${id}`);
        return response.data;
    }

    // Niveaux de classe
    async getClassLevels() {
        try {
            const response = await api.get('/class-levels');
            if (response?.data?.status === "success") {
                return response.data;
            }
            throw new Error(response?.data?.message || "Erreur lors du chargement des niveaux");
        } catch (error) {
            throw new Error(error?.response?.data?.message || error.message || "Erreur lors du chargement des niveaux");
        }
    }

    async createClassLevel(data) {
        const response = await api.post('/class-levels', data);
        return response.data;
    }

    async updateClassLevel(id, data) {
        const response = await api.put(`/class-levels/${id}`, data);
        return response.data;
    }

    async deleteClassLevel(id) {
        const response = await api.delete(`/class-levels/${id}`);
        return response.data;
    }

    // Groupes d'années
    async getYearGroups() {
        const response = await api.get('/year-groups');
        return response.data;
    }

    async createYearGroup(data) {
        const response = await api.post('/year-groups', data);
        return response.data;
    }

    async updateYearGroup(id, data) {
        const response = await api.put(`/year-groups/${id}`, data);
        return response.data;
    }

    async deleteYearGroup(id) {
        const response = await api.delete(`/year-groups/${id}`);
        return response.data;
    }

    // Courses
    async getCourses() {
        const response = await api.get('/courses');
        return response.data;
    }

    async createCourse(data) {
        const response = await api.post('/courses', data);
        return response.data;
    }

    async updateCourse(id, data) {
        const response = await api.put(`/courses/${id}`, data);
        return response.data;
    }

    async deleteCourse(id) {
        const response = await api.delete(`/courses/${id}`);
        return response.data;
    }

    // Examens
    async getExams() {
        try {
            const response = await api.get('/exams');
            if (response?.data?.status === "success") {
                return response.data;
            }
            throw new Error(response?.data?.message || "Erreur lors du chargement des examens");
        } catch (error) {
            throw new Error(error?.response?.data?.message || error.message || "Erreur lors du chargement des examens");
        }
    }

    async getExam(id) {
        const response = await api.get(`/exams/${id}`);
        return response.data;
    }

    async createExam(examData) {
        try {
            const formattedData = {
                ...examData,
                examDate: new Date(examData.examDate).toISOString(),
                passMark: parseInt(examData.passMark),
                totalMark: parseInt(examData.totalMark)
            };
            
            const response = await api.post('/exams', formattedData);
            if (response?.data?.status === "success") {
                return response.data;
            }
            throw new Error(response?.data?.message || "Erreur lors de la création de l'examen");
        } catch (error) {
            throw new Error(error?.response?.data?.message || error.message || "Erreur lors de la création de l'examen");
        }
    }

    async updateExam(id, examData) {
        try {
            const formattedData = {
                ...examData,
                examDate: new Date(examData.examDate).toISOString(),
                passMark: parseInt(examData.passMark),
                totalMark: parseInt(examData.totalMark)
            };
            
            const response = await api.put(`/exams/${id}`, formattedData);
            if (response?.data?.status === "success") {
                return response.data;
            }
            throw new Error(response?.data?.message || "Erreur lors de la mise à jour de l'examen");
        } catch (error) {
            throw new Error(error?.response?.data?.message || error.message || "Erreur lors de la mise à jour de l'examen");
        }
    }

    async deleteExam(id) {
        const response = await api.delete(`/exams/${id}`);
        return response.data;
    }

    // Questions d'examen
    async getQuestions(examId) {
        const response = await api.get(`/questions/${examId}`);
        return response.data;
    }

    async createQuestion(examId, data) {
        const response = await api.post(`/questions/${examId}`, data);
        return response.data;
    }

    async updateQuestion(id, data) {
        const response = await api.put(`/questions/${id}`, data);
        return response.data;
    }

    async deleteQuestion(id) {
        const response = await api.delete(`/questions/${id}`);
        return response.data;
    }

    // Résultats d'examen
    async getExamResults(examId) {
        const response = await api.get(`/exam-results/${examId}`);
        return response.data;
    }

    async createExamResult(data) {
        const response = await api.post('/exam-results', data);
        return response.data;
    }

    async updateExamResult(id, data) {
        const response = await api.put(`/exam-results/${id}`, data);
        return response.data;
    }

    async publishExamResult(id) {
        const response = await api.put(`/exam-results/${id}/publish`);
        return response.data;
    }

    // Statistiques
    async getDashboardStats() {
        const response = await api.get('/stats');
        return response.data;
    }
}

export const academicService = new AcademicService();