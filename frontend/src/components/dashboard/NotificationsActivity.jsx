import { useState, useEffect } from 'react';
import { FiBell, FiClock, FiActivity } from 'react-icons/fi';

const NotificationsActivity = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Simulated data - to be replaced with actual API calls
      setNotifications([
        {
          id: 1,
          type: 'info',
          message: 'Nouveau cours ajouté : React Avancé',
          time: '2 heures',
          read: false
        },
        {
          id: 2,
          type: 'warning',
          message: 'Rappel : Échéance de paiement proche',
          time: '3 heures',
          read: false
        },
        {
          id: 3,
          type: 'success',
          message: 'Notes du dernier examen publiées',
          time: '5 heures',
          read: true
        }
      ]);

      setActivities([
        {
          id: 1,
          user: 'Mohammed Ali',
          action: 'a ajouté un nouveau étudiant',
          time: 'Il y a 10 minutes'
        },
        {
          id: 2,
          user: 'Sarah Lambert',
          action: 'a mis à jour le planning des cours',
          time: 'Il y a 30 minutes'
        },
        {
          id: 3,
          user: 'Jean Dupont',
          action: 'a enregistré un nouveau paiement',
          time: 'Il y a 1 heure'
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <span className="text-yellow-500">⚠️</span>;
      case 'success':
        return <span className="text-green-500">✅</span>;
      default:
        return <span className="text-blue-500">ℹ️</span>;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center px-6 py-4 text-sm font-medium ${
              activeTab === 'notifications'
                ? 'border-b-2 border-mandarine-500 text-mandarine-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiBell className="w-5 h-5 mr-2" />
            Notifications
            <span className="ml-2 bg-mandarine-100 text-mandarine-600 px-2 py-1 rounded-full text-xs">
              {notifications.filter(n => !n.read).length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center px-6 py-4 text-sm font-medium ${
              activeTab === 'activity'
                ? 'border-b-2 border-mandarine-500 text-mandarine-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiActivity className="w-5 h-5 mr-2" />
            Activités récentes
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'notifications' ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start p-3 rounded-lg ${
                  notification.read ? 'bg-gray-50' : 'bg-mandarine-50'
                }`}
              >
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <div className="flex items-center mt-1">
                    <FiClock className="w-4 h-4 text-gray-400" />
                    <span className="ml-1 text-xs text-gray-500">
                      Il y a {notification.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start p-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {activity.user.charAt(0)}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm">
                    <span className="font-medium text-gray-900">
                      {activity.user}
                    </span>{' '}
                    {activity.action}
                  </p>
                  <div className="flex items-center mt-1">
                    <FiClock className="w-4 h-4 text-gray-400" />
                    <span className="ml-1 text-xs text-gray-500">
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsActivity;