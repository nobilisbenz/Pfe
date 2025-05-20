import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';
import { academicService } from '../../services/academic.service';

const ExamResultsManagement = ({ examId }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [formData, setFormData] = useState({
    studentID: '',
    grade: 0,
    score: 0,
    passMark: 50,
    status: 'Fail',
    remarks: 'Poor',
    academicTerm: '',
    academicYear: '',
    answeredQuestions: []
  });

  useEffect(() => {
    if (examId) {
      loadResults();
    }
  }, [examId]);

  const loadResults = async () => {
    try {
      const response = await academicService.getExamResults(examId);
      setResults(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des résultats');
      setLoading(false);
    }
  };

  const calculateRemarks = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Poor';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        exam: examId,
        status: formData.score >= formData.passMark ? 'Pass' : 'Fail',
        remarks: calculateRemarks(formData.score)
      };

      if (selectedResult) {
        await academicService.updateExamResult(selectedResult._id, data);
      } else {
        await academicService.createExamResult(data);
      }
      loadResults();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePublish = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir publier ce résultat ?')) {
      try {
        await academicService.publishExamResult(id);
        loadResults();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedResult(null);
    setFormData({
      studentID: '',
      grade: 0,
      score: 0,
      passMark: 50,
      status: 'Fail',
      remarks: 'Poor',
      academicTerm: '',
      academicYear: '',
      answeredQuestions: []
    });
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Résultats de l'examen</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-mandarine-500 text-white rounded-md hover:bg-mandarine-600"
        >
          <FiPlus className="mr-2" />
          Nouveau Résultat
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Étudiant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Note
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remarques
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Publié
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result) => (
              <tr key={result._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{result.studentID}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{result.grade}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{result.score}/{result.passMark}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    result.status === 'Pass'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{result.remarks}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    result.isPublished
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {result.isPublished ? 'Publié' : 'Non publié'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedResult(result);
                      setFormData({
                        studentID: result.studentID,
                        grade: result.grade,
                        score: result.score,
                        passMark: result.passMark,
                        status: result.status,
                        remarks: result.remarks,
                        academicTerm: result.academicTerm?._id || '',
                        academicYear: result.academicYear?._id || '',
                        answeredQuestions: result.answeredQuestions || []
                      });
                      setIsModalOpen(true);
                    }}
                    className="text-mandarine-600 hover:text-mandarine-900 mr-3"
                  >
                    <FiEdit2 className="w-5 h-5" />
                  </button>
                  {!result.isPublished && (
                    <button
                      onClick={() => handlePublish(result._id)}
                      className="text-green-600 hover:text-green-900 mr-3"
                      title="Publier le résultat"
                    >
                      <FiCheck className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal pour ajouter/modifier un résultat */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedResult ? 'Modifier le résultat' : 'Nouveau résultat'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiPlus className="w-6 h-6 transform rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Étudiant
                </label>
                <input
                  type="text"
                  value={formData.studentID}
                  onChange={(e) => setFormData({ ...formData, studentID: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note
                  </label>
                  <input
                    type="number"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                    min="0"
                    max="20"
                    step="0.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Score
                  </label>
                  <input
                    type="number"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note de passage
                </label>
                <input
                  type="number"
                  value={formData.passMark}
                  onChange={(e) => setFormData({ ...formData, passMark: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-mandarine-500 text-white rounded-md hover:bg-mandarine-600"
                >
                  {selectedResult ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamResultsManagement;