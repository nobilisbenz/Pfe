import { useCallback, useMemo } from 'react';
import { useDataFetching } from './useDataFetching';
import { academicService } from '../services/academic.service';
import { financeService } from '../services/finance.service';
import { userService } from '../services/user.service';
import { useAuth } from './useAuth';

export const useStats = (options = {}) => {
    const { 
        period = 'month',
        type = 'all',
        cached = true 
    } = options;

    const { isAdmin } = useAuth();

    // Charger les données académiques
    const { 
        data: academicData,
        loading: academicLoading,
        error: academicError,
        refetch: refetchAcademic
    } = useDataFetching(
        async () => {
            const exams = await academicService.getExams();
            const results = await academicService.getExamResults();
            return { exams, results };
        },
        cached ? 'academic-stats' : null,
        30 * 60 * 1000 // Cache de 30 minutes
    );

    // Charger les données financières (admin uniquement)
    const {
        data: financeData,
        loading: financeLoading,
        error: financeError,
        refetch: refetchFinance
    } = useDataFetching(
        () => isAdmin ? financeService.getFinancialReport({ period }) : null,
        cached && isAdmin ? `finance-stats-${period}` : null,
        15 * 60 * 1000 // Cache de 15 minutes
    );

    // Charger les données des utilisateurs
    const {
        data: userData,
        loading: userLoading,
        error: userError,
        refetch: refetchUser
    } = useDataFetching(
        async () => {
            const teachers = await userService.getAllTeachers();
            const students = await userService.getAllStudents();
            return { teachers, students };
        },
        cached ? 'user-stats' : null,
        60 * 60 * 1000 // Cache d'une heure
    );

    // Calculer les statistiques académiques
    const academicStats = useMemo(() => {
        if (!academicData?.exams || !academicData?.results) return null;

        const { exams, results } = academicData;
        
        return {
            totalExams: exams.length,
            examsPassed: results.filter(r => r.status === 'Pass').length,
            examsFailed: results.filter(r => r.status === 'Fail').length,
            averageScore: results.reduce((acc, r) => acc + r.score, 0) / results.length || 0,
            examsBySubject: exams.reduce((acc, exam) => {
                acc[exam.subject] = (acc[exam.subject] || 0) + 1;
                return acc;
            }, {}),
            resultsByGrade: results.reduce((acc, result) => {
                acc[result.grade] = (acc[result.grade] || 0) + 1;
                return acc;
            }, {})
        };
    }, [academicData]);

    // Calculer les statistiques des utilisateurs
    const userStats = useMemo(() => {
        if (!userData?.teachers || !userData?.students) return null;

        const { teachers, students } = userData;

        return {
            totalTeachers: teachers.length,
            totalStudents: students.length,
            studentsByYear: students.reduce((acc, student) => {
                const year = new Date(student.dateAdmitted).getFullYear();
                acc[year] = (acc[year] || 0) + 1;
                return acc;
            }, {}),
            teachersBySubject: teachers.reduce((acc, teacher) => {
                teacher.subjects?.forEach(subject => {
                    acc[subject] = (acc[subject] || 0) + 1;
                });
                return acc;
            }, {})
        };
    }, [userData]);

    // Fonction pour générer des rapports personnalisés
    const generateReport = useCallback(async (reportType, filters = {}) => {
        try {
            let reportData = {};

            switch (reportType) {
                case 'academic':
                    reportData = {
                        ...academicStats,
                        period,
                        filters
                    };
                    break;
                case 'financial':
                    if (!isAdmin) throw new Error('Accès non autorisé');
                    reportData = {
                        ...financeData,
                        period,
                        filters
                    };
                    break;
                case 'users':
                    reportData = {
                        ...userStats,
                        period,
                        filters
                    };
                    break;
                case 'complete':
                    reportData = {
                        academic: academicStats,
                        finance: isAdmin ? financeData : undefined,
                        users: userStats,
                        period,
                        filters
                    };
                    break;
                default:
                    throw new Error('Type de rapport non valide');
            }

            return reportData;
        } catch (error) {
            console.error('Erreur lors de la génération du rapport:', error);
            throw error;
        }
    }, [academicStats, financeData, userStats, period, isAdmin]);

    return {
        academicStats,
        financeData: isAdmin ? financeData : null,
        userStats,
        loading: academicLoading || (isAdmin && financeLoading) || userLoading,
        error: academicError || (isAdmin && financeError) || userError,
        generateReport,
        refetch: async () => {
            await Promise.all([
                refetchAcademic(),
                isAdmin && refetchFinance(),
                refetchUser()
            ]);
        }
    };
};