import { useCallback, useState } from 'react';
import { useDataFetching } from './useDataFetching';
import { academicService } from '../services/academic.service';
import { useWebSocket } from './useWebSocket';
import { useAuth } from './useAuth';

export const useExams = (examId = null) => {
    const { isTeacher, isStudent } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    // Charger un examen spécifique ou tous les examens
    const {
        data: examData,
        loading,
        error,
        refetch
    } = useDataFetching(
        () => examId ? academicService.getExam(examId) : academicService.getExams(),
        examId ? `exam-${examId}` : 'exams',
        30 * 60 * 1000 // Cache de 30 minutes
    );

    // Gérer les mises à jour en temps réel des résultats
    useWebSocket('EXAM_RESULT', (data) => {
        if (data.examId === examId) {
            refetch();
        }
    });

    // Créer un nouvel examen (pour les enseignants)
    const createExam = useCallback(async (examData) => {
        if (!isTeacher) return;
        try {
            const response = await academicService.createExam(examData);
            refetch();
            return response;
        } catch (error) {
            throw error;
        }
    }, [isTeacher, refetch]);

    // Mettre à jour un examen (pour les enseignants)
    const updateExam = useCallback(async (examId, examData) => {
        if (!isTeacher) return;
        try {
            const response = await academicService.updateExam(examId, examData);
            refetch();
            return response;
        } catch (error) {
            throw error;
        }
    }, [isTeacher, refetch]);

    // Ajouter une question (pour les enseignants)
    const addQuestion = useCallback(async (examId, questionData) => {
        if (!isTeacher) return;
        try {
            const response = await academicService.createQuestion(examId, questionData);
            refetch();
            return response;
        } catch (error) {
            throw error;
        }
    }, [isTeacher, refetch]);

    // Soumettre un examen (pour les étudiants)
    const submitExam = useCallback(async (examId, answers) => {
        if (!isStudent) return;
        setSubmitting(true);
        try {
            const response = await academicService.writeExam(examId, answers);
            refetch();
            return response;
        } catch (error) {
            throw error;
        } finally {
            setSubmitting(false);
        }
    }, [isStudent, refetch]);

    // Vérifier les résultats d'un examen
    const checkResults = useCallback(async (examResultId) => {
        try {
            const response = await academicService.checkExamResults(examResultId);
            return response;
        } catch (error) {
            throw error;
        }
    }, []);

    return {
        exam: examId ? examData?.data : null,
        exams: !examId ? examData?.data : [],
        loading,
        error,
        submitting,
        createExam,
        updateExam,
        addQuestion,
        submitExam,
        checkResults,
        refetch
    };
};