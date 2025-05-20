import { useState, useEffect, useCallback } from 'react';
import { useDataFetching } from './useDataFetching';
import { academicService } from '../services/academic.service';
import { userService } from '../services/user.service';
import { financeService } from '../services/finance.service';
import { useAuth } from './useAuth';
import { useWebSocket } from './useWebSocket';

export const useDashboard = () => {
    const { isAdmin, isTeacher, isStudent } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Charger les données académiques
    const { data: academicData } = useDataFetching(
        () => Promise.all([
            academicService.getAcademicYears(),
            academicService.getPrograms(),
            academicService.getClassLevels()
        ]),
        'dashboard-academic',
        60 * 60 * 1000 // Cache d'une heure
    );

    // Charger les données des utilisateurs
    const { data: userData } = useDataFetching(
        () => Promise.all([
            userService.getAllTeachers(),
            userService.getAllStudents()
        ]),
        'dashboard-users',
        30 * 60 * 1000 // Cache de 30 minutes
    );

    // Charger les données financières (admin uniquement)
    const { data: financeData } = useDataFetching(
        () => isAdmin ? financeService.getFinancialOverview() : null,
        isAdmin ? 'dashboard-finance' : null,
        15 * 60 * 1000 // Cache de 15 minutes
    );

    // Écouter les mises à jour en temps réel
    useWebSocket('USER_STATUS', (data) => {
        updateDashboardData();
    });

    useWebSocket('EXAM_RESULT', (data) => {
        updateDashboardData();
    });

    // Mettre à jour les données du tableau de bord
    const updateDashboardData = useCallback(() => {
        if (!academicData || !userData) return;

        const [academicYears, programs, classLevels] = academicData;
        const [teachers, students] = userData;

        const dashboardStats = {
            totalStudents: students?.length || 0,
            totalTeachers: teachers?.length || 0,
            totalPrograms: programs?.length || 0,
            totalClasses: classLevels?.length || 0,
            currentAcademicYear: academicYears?.[0],
            recentActivity: [],
            stats: {
                studentsByProgram: programs?.map(program => ({
                    program: program.name,
                    count: students?.filter(s => s.program === program._id).length || 0
                })),
                studentsByClass: classLevels?.map(level => ({
                    class: level.name,
                    count: students?.filter(s => s.currentClassLevel === level._id).length || 0
                }))
            }
        };

        if (isAdmin && financeData) {
            dashboardStats.finance = {
                totalRevenue: financeData.totalRevenue,
                pendingPayments: financeData.pendingPayments,
                recentTransactions: financeData.recentTransactions
            };
        }

        setDashboardData(dashboardStats);
        setLoading(false);
    }, [academicData, userData, financeData, isAdmin]);

    // Mettre à jour les données lors des changements
    useEffect(() => {
        updateDashboardData();
    }, [updateDashboardData]);

    // Filtrer les données en fonction du rôle
    const getFilteredData = useCallback(() => {
        if (!dashboardData) return null;

        if (isAdmin) {
            return dashboardData;
        }

        if (isTeacher) {
            return {
                ...dashboardData,
                finance: undefined,
                stats: {
                    ...dashboardData.stats,
                    // Filtrer pour ne montrer que les classes assignées
                    studentsByClass: dashboardData.stats.studentsByClass.filter(
                        c => /* logique de filtrage pour les enseignants */
                        true
                    )
                }
            };
        }

        if (isStudent) {
            return {
                currentAcademicYear: dashboardData.currentAcademicYear,
                recentActivity: dashboardData.recentActivity.filter(
                    activity => /* logique de filtrage pour les étudiants */
                    true
                )
            };
        }

        return null;
    }, [dashboardData, isAdmin, isTeacher, isStudent]);

    return {
        data: getFilteredData(),
        loading,
        refresh: updateDashboardData
    };
};