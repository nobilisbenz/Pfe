import api from '../config/axios.config';

export const userService = {
    // Teachers
    async addTeacher(data) {
        const response = await api.post('/teachers/admin/register', data);
        return response.data;
    },
    async getAllTeachers() {
        const response = await api.get('/teachers/admin');
        return response.data;
    },
    async getTeacherProfile() {
        const response = await api.get('/teachers/profile');
        return response.data;
    },
    async getTeacherById(id) {
        const response = await api.get(`/teachers/${id}/admin`);
        return response.data;
    },
    async updateTeacherProfile(data) {
        const response = await api.put('/teachers/update', data);
        return response.data;
    },
    async adminUpdateTeacher(teacherId, data) {
        const response = await api.put(`/teachers/${teacherId}/update/admin`, data);
        return response.data;
    },

    // Students
    async addStudent(data) {
        const response = await api.post('/students/admin/register', data);
        return response.data;
    },
    async getAllStudents() {
        const response = await api.get('/students/admin');
        return response.data;
    },
    async getStudentProfile() {
        const response = await api.get('/students/profile');
        return response.data;
    },
    async getStudentById(id) {
        const response = await api.get(`/students/${id}/admin`);
        return response.data;
    },
    async updateStudentProfile(data) {
        const response = await api.put('/students/update', data);
        return response.data;
    },
    async adminUpdateStudent(studentId, data) {
        const response = await api.put(`/students/${studentId}/update/admin`, data);
        return response.data;
    },

    // Actions administratives
    async suspendTeacher(teacherId) {
        const response = await api.put(`/admins/suspend/teacher/${teacherId}`);
        return response.data;
    },
    async unsuspendTeacher(teacherId) {
        const response = await api.put(`/admins/unsuspend/teacher/${teacherId}`);
        return response.data;
    },
    async withdrawTeacher(teacherId) {
        const response = await api.put(`/admins/withdraw/teacher/${teacherId}`);
        return response.data;
    },
    async unwithdrawTeacher(teacherId) {
        const response = await api.put(`/admins/unwithdraw/teacher/${teacherId}`);
        return response.data;
    }
};