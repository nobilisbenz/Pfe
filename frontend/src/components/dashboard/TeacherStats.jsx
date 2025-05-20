import { useState, useEffect } from 'react';
import { FiUsers, FiBook, FiCalendar, FiCheckSquare } from 'react-icons/fi';

const TeacherStats = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    upcomingExams: 0,
    submissions: 0,
    loading: true
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // TODO: Replace with actual API call
      setStats({
        totalStudents: 120,
        activeCourses: 4,
        upcomingExams: 2,
        submissions: 45,
        loading: false
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Étudiants',
      value: stats.totalStudents,
      icon: FiUsers,
      color: 'blue',
      trend: '+12 cette semaine'
    },
    {
      title: 'Cours Actifs',
      value: stats.activeCourses,
      icon: FiBook,
      color: 'green',
      trend: '+1 nouveau cours'
    },
    {
      title: 'Examens à venir',
      value: stats.upcomingExams,
      icon: FiCalendar,
      color: 'yellow',
      trend: 'Dans les 7 jours'
    },
    {
      title: 'Soumissions',
      value: stats.submissions,
      icon: FiCheckSquare,
      color: 'purple',
      trend: '15 non notées'
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

export default TeacherStats;