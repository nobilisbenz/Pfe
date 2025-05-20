import { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

const TeacherDetails = ({ teacher, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    dateEmployed: '',
    qualification: '',
    teacherId: '',
    isWithdrawn: false,
    isSuspended: false
  });

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name || '',
        email: teacher.email || '',
        subject: teacher.subject || '',
        dateEmployed: teacher.dateEmployed || '',
        qualification: teacher.qualification || '',
        teacherId: teacher.teacherId || '',
        isWithdrawn: teacher.isWithdrawn || false,
        isSuspended: teacher.isSuspended || false
      });
    }
  }, [teacher]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Détails de l'enseignant</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matière enseignée
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Sélectionner une matière</option>
                <option value="mathematiques">Mathématiques</option>
                <option value="informatique">Informatique</option>
                <option value="gestion">Gestion</option>
                <option value="langues">Langues</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'embauche
              </label>
              <input
                type="date"
                name="dateEmployed"
                value={formData.dateEmployed}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualification
              </label>
              <select
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Sélectionner une qualification</option>
                <option value="doctorat">Doctorat</option>
                <option value="master">Master</option>
                <option value="licence">Licence</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Identifiant enseignant
              </label>
              <input
                type="text"
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="col-span-2">
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isSuspended"
                    checked={formData.isSuspended}
                    onChange={handleChange}
                    className="w-4 h-4 text-mandarine-600 rounded border-gray-300 focus:ring-mandarine-500"
                  />
                  <span className="text-sm text-gray-700">Suspendu</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isWithdrawn"
                    checked={formData.isWithdrawn}
                    onChange={handleChange}
                    className="w-4 h-4 text-mandarine-600 rounded border-gray-300 focus:ring-mandarine-500"
                  />
                  <span className="text-sm text-gray-700">Retiré</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mandarine-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-mandarine-600 text-white rounded-md hover:bg-mandarine-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mandarine-500"
            >
              <FiSave className="w-5 h-5 mr-2" />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherDetails;