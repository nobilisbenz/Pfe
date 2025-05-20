import { useState, useEffect } from 'react';
import { FiUsers, FiUserCheck, FiDollarSign, FiBookOpen } from 'react-icons/fi';
import { academicService } from '../../services/academic.service';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeTeachers: 0,
    monthlyRevenue: 0,
    totalCourses: 0,
    examSuccess: 0,
    loading: true,
    trends: {
      students: 0,
      teachers: 0,
      revenue: 0,
      courses: 0
    }
  });

  useEffect(() => {
    loadStats();
    // Rafraîchir les statistiques toutes les 5 minutes
    const interval = setInterval(loadStats, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await academicService.getDashboardStats();
      if (response.status === "success") {
        setStats({
          ...response.data,
          loading: false
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const statCards = [
    {
      title: 'Total Étudiants',
      value: stats.totalStudents,
      icon: FiUsers,
      color: 'mandarine',
      trend: `${stats.trends.students}%`,
      trendUp: parseFloat(stats.trends.students) >= 0
    },
    {
      title: 'Enseignants Actifs',
      value: stats.activeTeachers,
      icon: FiUserCheck,
      color: 'green',
      trend: `${stats.trends.teachers}%`,
      trendUp: parseFloat(stats.trends.teachers) >= 0
    },
    {
      title: 'Taux de Réussite',
      value: `${stats.examSuccess}%`,
      icon: FiDollarSign,
      color: 'blue',
      trend: `${stats.trends.revenue}%`,
      trendUp: parseFloat(stats.trends.revenue) >= 0
    },
    {
      title: 'Total Cours',
      value: stats.totalCourses,
      icon: FiBookOpen,
      color: 'purple',
      trend: `${stats.trends.courses}%`,
      trendUp: parseFloat(stats.trends.courses) >= 0
    }
  ];

  if (stats.loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-full bg-${stat.color}-100`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
            <span className={`text-sm font-medium ${
              stat.trendUp ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.trend}
            </span>
          </div>
          <h3 className="text-lg font-medium text-gray-500">{stat.title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;