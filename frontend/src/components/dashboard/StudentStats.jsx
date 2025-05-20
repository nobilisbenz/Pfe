import { useState, useEffect } from 'react';
import { FiBook, FiCalendar, FiCheckSquare, FiTrendingUp } from 'react-icons/fi';

const StudentStats = () => {
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    upcomingExams: 0,
    completedAssignments: 0,
    averageGrade: 0,
    loading: true
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // TODO: Replace with actual API call
      setStats({
        enrolledCourses: 5,
        upcomingExams: 2,
        completedAssignments: 15,
        averageGrade: 85,
        loading: false
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const statCards = [
    {
      title: 'Cours inscrits',
      value: stats.enrolledCourses,
      icon: FiBook,
      color: 'blue',
      trend: '2 en cours'
    },
    {
      title: 'Examens à venir',
      value: stats.upcomingExams,
      icon: FiCalendar,
      color: 'yellow',
      trend: 'Cette semaine'
    },
    {
      title: 'Devoirs complétés',
      value: stats.completedAssignments,
      icon: FiCheckSquare,
      color: 'green',
      trend: '3 en attente'
    },
    {
      title: 'Moyenne générale',
      value: `${stats.averageGrade}%`,
      icon: FiTrendingUp,
      color: 'purple',
      trend: '+5% ce semestre'
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
          </div>
          <h3 className="text-lg font-medium text-gray-500">{stat.title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
          <p className="text-sm text-gray-600 mt-2">{stat.trend}</p>
        </div>
      ))}
    </div>
  );
};

export default StudentStats;