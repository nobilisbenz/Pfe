import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiX } from 'react-icons/fi';
import { academicService } from '../services/academic.service';

const AddUserModal = ({ isOpen, onClose, onSubmit, userData, userType }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: userType === 'teacher' ? 'teacher' : 'student',
    currentClassLevel: '',
    program: null,
    dateAdmitted: '',
    isSuspended: false,
    isWithdrawn: false
  });

  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const response = await academicService.getPrograms();
        if (response.status === 'success' && response.data) {
          setPrograms(response.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des programmes:', error);
      }
    };

    loadPrograms();
  }, []);

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        password: '',
        role: userData.role || (userType === 'teacher' ? 'teacher' : 'student'),
        currentClassLevel: userData.currentClassLevel || '',
        program: userData.program || null,
        dateAdmitted: userData.dateAdmitted ? new Date(userData.dateAdmitted).toISOString().split('T')[0] : '',
        isSuspended: userData.isSuspended || false,
        isWithdrawn: userData.isWithdrawn || false
      });
    }
  }, [userData, userType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'program' && value === '' ? null : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay avec effet de flou */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity z-40"
        onClick={onClose}
      />
      
      {/* Modal centré avec animation */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div 
          className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col transform transition-all duration-300 scale-100 opacity-100"
          style={{
            animation: isOpen ? 'modalFadeIn 0.3s ease-out' : 'none'
          }}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {userData ? 'Modifier' : 'Ajouter'} un {userType === 'teacher' ? 'enseignant' : 'étudiant'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                  required
                />
              </div>

              {!userData && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                    required={!userData}
                  />
                </div>
              )}

              {userType === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Niveau de classe
                    </label>
                    <select
                      name="currentClassLevel"
                      value={formData.currentClassLevel}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                    >
                      <option value="">Sélectionner un niveau</option>
                      <option value="Level 100">Première année</option>
                      <option value="Level 200">Deuxième année</option>
                      <option value="Level 300">Troisième année</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Programme
                    </label>
                    <select
                      name="program"
                      value={formData.program || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                    >
                      <option value="">Sélectionner un programme</option>
                      {programs.map((program) => (
                        <option key={program._id} value={program._id}>
                          {program.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'admission
                    </label>
                    <input
                      type="date"
                      name="dateAdmitted"
                      value={formData.dateAdmitted}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isSuspended"
                        checked={formData.isSuspended}
                        onChange={handleChange}
                        className="w-4 h-4 text-mandarine-600 border-gray-300 rounded focus:ring-mandarine-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Suspendu</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isWithdrawn"
                        checked={formData.isWithdrawn}
                        onChange={handleChange}
                        className="w-4 h-4 text-mandarine-600 border-gray-300 rounded focus:ring-mandarine-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Retiré</span>
                    </label>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-mandarine-500 text-white rounded-md hover:bg-mandarine-600"
                >
                  {userData ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

AddUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  userData: PropTypes.object,
  userType: PropTypes.oneOf(['teacher', 'student']).isRequired
};

export default AddUserModal;