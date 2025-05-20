import { useState, useEffect, useCallback } from 'react';
import { FiEdit, FiTrash2, FiUserPlus } from 'react-icons/fi';
import { userService } from '../../services/user.service';
import AddUserModal from '../AddUserModal';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getAllStudents();
      setStudents(response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des étudiants');
      console.error('Erreur de chargement:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      try {
        setLoading(true);
        // TODO: Implement delete student
        await loadStudents();
        setError('');
      } catch (err) {
        setError('Erreur lors de la suppression de l\'étudiant');
        console.error('Erreur de suppression:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleModalSubmit = async (userData) => {
    try {
      setLoading(true);
      if (selectedStudent) {
        await userService.adminUpdateStudent(selectedStudent._id, userData);
      } else {
        await userService.addStudent(userData);
      }
      await loadStudents();
      handleModalClose();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Erreur de soumission:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mandarine-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Liste des Étudiants</h2>
        <button
          onClick={handleAddStudent}
          className="flex items-center px-4 py-2 bg-mandarine-500 text-white rounded-lg hover:bg-mandarine-600 transition-colors"
        >
          <FiUserPlus className="w-5 h-5 mr-2" />
          Ajouter un étudiant
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded m-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Étudiant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Étudiant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-mandarine-100 flex items-center justify-center">
                      <span className="font-medium text-mandarine-600">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">Étudiant</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.studentId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    student.isWithdrawn || student.isSuspended
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {student.isWithdrawn ? 'Retiré' : student.isSuspended ? 'Suspendu' : 'Actif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleEditStudent(student)}
                    className="text-mandarine-600 hover:text-mandarine-900 mr-3"
                  >
                    <FiEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <AddUserModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          userData={selectedStudent}
          userType="student"
        />
      )}
    </div>
  );
};

export default StudentList;