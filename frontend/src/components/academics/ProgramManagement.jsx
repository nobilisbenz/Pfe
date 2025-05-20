import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';
import { academicService } from '../../services/academic.service';

const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    academicYear: '',
    classLevel: '',
    schedule: {
      startDate: '',
      endDate: '',
      weekSchedule: []
    }
  });

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const response = await academicService.getPrograms();
      if (response.status === 'success') {
        setPrograms(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des programmes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedProgram) {
        await academicService.updateProgram(selectedProgram._id, formData);
      } else {
        await academicService.createProgram(formData);
      }
      await loadPrograms();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await academicService.updateProgramSchedule(selectedProgram._id, {
        weekSchedule: formData.schedule.weekSchedule
      });
      await loadPrograms();
      setIsScheduleModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'emploi du temps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (program) => {
    setSelectedProgram(program);
    setFormData({
      name: program.name,
      description: program.description,
      duration: program.duration,
      academicYear: program.academicYear,
      classLevel: program.classLevel,
      schedule: program.schedule || {
        startDate: '',
        endDate: '',
        weekSchedule: []
      }
    });
    setIsModalOpen(true);
  };

  const handleScheduleEdit = (program) => {
    setSelectedProgram(program);
    setFormData(prev => ({
      ...prev,
      schedule: program.schedule || {
        startDate: '',
        endDate: '',
        weekSchedule: []
      }
    }));
    setIsScheduleModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce programme ?')) {
      try {
        await academicService.deleteProgram(id);
        await loadPrograms();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: '',
      academicYear: '',
      classLevel: '',
      schedule: {
        startDate: '',
        endDate: '',
        weekSchedule: []
      }
    });
    setSelectedProgram(null);
  };

  const addTimeSlot = (dayIndex) => {
    setFormData(prev => {
      const newSchedule = { ...prev.schedule };
      if (!newSchedule.weekSchedule[dayIndex]) {
        newSchedule.weekSchedule[dayIndex] = {
          day: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][dayIndex],
          slots: []
        };
      }
      newSchedule.weekSchedule[dayIndex].slots.push({
        startTime: '',
        endTime: '',
        subject: '',
        teacher: '',
        room: '',
        type: 'Cours'
      });
      return { ...prev, schedule: newSchedule };
    });
  };

  const removeTimeSlot = (dayIndex, slotIndex) => {
    setFormData(prev => {
      const newSchedule = { ...prev.schedule };
      newSchedule.weekSchedule[dayIndex].slots.splice(slotIndex, 1);
      return { ...prev, schedule: newSchedule };
    });
  };

  return (
    <div className="container mx-auto px-4 ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Gestion des Programmes</h2>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-mandarine-500 text-white rounded-lg hover:bg-mandarine-600 transition-colors"
        >
          <FiPlus className="mr-2" /> Nouveau Programme
        </button>
      </div>

      {/* Liste des programmes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {programs.map((program) => (
              <tr key={program._id}>
                <td className="px-6 py-4 whitespace-nowrap">{program.name}</td>
                <td className="px-6 py-4">{program.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">{program.duration}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => handleScheduleEdit(program)}
                    className="text-blue-600 hover:text-blue-900 mx-2"
                    title="Gérer l'emploi du temps"
                  >
                    <FiCalendar className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(program)}
                    className="text-green-600 hover:text-green-900 mx-2"
                  >
                    <FiEdit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(program._id)}
                    className="text-red-600 hover:text-red-900 mx-2"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Programme */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{selectedProgram ? 'Modifier' : 'Nouveau'} Programme</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Durée</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Emploi du temps */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Emploi du temps - {selectedProgram?.name}</h3>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-gray-400 hover:text-gray-500">×</button>
            </div>
            <form onSubmit={handleScheduleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de début</label>
                    <input
                      type="date"
                      value={formData.schedule.startDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, startDate: e.target.value }
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de fin</label>
                    <input
                      type="date"
                      value={formData.schedule.endDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, endDate: e.target.value }
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                    />
                  </div>
                </div>

                {/* Emploi du temps par jour */}
                <div className="space-y-6">
                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map((day, dayIndex) => (
                    <div key={day} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium">{day}</h4>
                        <button
                          type="button"
                          onClick={() => addTimeSlot(dayIndex)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiPlus /> Ajouter un créneau
                        </button>
                      </div>
                      {formData.schedule.weekSchedule[dayIndex]?.slots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="grid grid-cols-6 gap-4 mb-4">
                          <div>
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => {
                                const newSchedule = { ...formData.schedule };
                                newSchedule.weekSchedule[dayIndex].slots[slotIndex].startTime = e.target.value;
                                setFormData(prev => ({ ...prev, schedule: newSchedule }));
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                            />
                          </div>
                          <div>
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => {
                                const newSchedule = { ...formData.schedule };
                                newSchedule.weekSchedule[dayIndex].slots[slotIndex].endTime = e.target.value;
                                setFormData(prev => ({ ...prev, schedule: newSchedule }));
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                            />
                          </div>
                          <div>
                            <select
                              value={slot.type}
                              onChange={(e) => {
                                const newSchedule = { ...formData.schedule };
                                newSchedule.weekSchedule[dayIndex].slots[slotIndex].type = e.target.value;
                                setFormData(prev => ({ ...prev, schedule: newSchedule }));
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                            >
                              <option value="Cours">Cours</option>
                              <option value="TP">TP</option>
                              <option value="TD">TD</option>
                            </select>
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Salle"
                              value={slot.room}
                              onChange={(e) => {
                                const newSchedule = { ...formData.schedule };
                                newSchedule.weekSchedule[dayIndex].slots[slotIndex].room = e.target.value;
                                setFormData(prev => ({ ...prev, schedule: newSchedule }));
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                            />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramManagement;