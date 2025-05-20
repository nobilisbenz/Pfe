import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { academicService } from '../services/academic.service';
import { useAuth } from '../contexts/AuthContext';
import { format, addWeeks, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

const Schedule = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { darkMode } = useTheme();
  const { user } = useAuth();

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const timeSlots = [
    '08:00 - 09:30',
    '09:45 - 11:15',
    '11:30 - 13:00',
    '14:00 - 15:30',
    '15:45 - 17:15',
    '17:30 - 19:00'
  ];

  useEffect(() => {
    loadSchedule();
  }, [currentWeek, user]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const startDate = format(
        addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), currentWeek),
        'yyyy-MM-dd'
      );
      
      // Construire la requête en fonction du rôle
      let query = { weekNumber: currentWeek + 1, year: new Date().getFullYear() };
      if (user.role === 'student' && user.program) {
        query.program = user.program;
      }
      
      const response = await academicService.getSchedules(query);
      setSchedule(response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement de l\'emploi du temps');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentWeekLabel = () => {
    const startDate = addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), currentWeek);
    return format(startDate, "'Semaine du' dd MMMM yyyy", { locale: fr });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mandarine-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Emploi du temps</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentWeek(currentWeek - 1)}
            className="bg-mandarine-500 text-white px-4 py-2 rounded-lg hover:bg-mandarine-600 transition-colors"
          >
            Semaine précédente
          </button>
          <span className="px-4 py-2 font-medium">{getCurrentWeekLabel()}</span>
          <button
            onClick={() => setCurrentWeek(currentWeek + 1)}
            className="bg-mandarine-500 text-white px-4 py-2 rounded-lg hover:bg-mandarine-600 transition-colors"
          >
            Semaine suivante
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Horaire
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {timeSlots.map((timeSlot, timeIndex) => (
              <tr key={timeSlot}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {timeSlot}
                </td>
                {days.map((day, dayIndex) => {
                  const slot = schedule?.weekSchedule?.[dayIndex]?.slots?.find(
                    s => s.startTime === timeSlot.split(' - ')[0]
                  );
                  
                  return (
                    <td key={`${day}-${timeSlot}`} className="px-6 py-4">
                      {slot ? (
                        <div className="bg-mandarine-50 dark:bg-gray-700 p-3 rounded-lg shadow">
                          <div className="font-semibold text-mandarine-600 dark:text-mandarine-400">
                            {slot.subject?.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {slot.teacher?.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Salle: {slot.room}
                          </div>
                        </div>
                      ) : (
                        <div className="h-16"></div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Schedule;