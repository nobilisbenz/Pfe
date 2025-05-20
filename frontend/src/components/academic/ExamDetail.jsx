import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiX } from 'react-icons/fi';
import { academicService } from '../../services/academic.service';

const ExamDetail = ({ examId, onClose }) => {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadExamDetails();
  }, [examId]);

  const loadExamDetails = async () => {
    try {
      const response = await academicService.getExamById(examId);
      setExam(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des détails de l\'examen');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg">
      <div className="flex justify-between items-center border-b border-gray-200 p-4">
        <h2 className="text-xl font-semibold text-gray-800">{exam?.name}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Matière</h3>
            <p className="mt-1 text-sm text-gray-900">{exam?.subject?.name}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Programme</h3>
            <p className="mt-1 text-sm text-gray-900">{exam?.program?.name}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Date de l'examen</h3>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(exam?.examDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Heure</h3>
            <p className="mt-1 text-sm text-gray-900">{exam?.examTime}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Durée</h3>
            <p className="mt-1 text-sm text-gray-900">{exam?.duration} minutes</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Notes</h3>
            <p className="mt-1 text-sm text-gray-900">
              Total: {exam?.totalMarks} / Passage: {exam?.passingMarks}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Description</h3>
          <p className="mt-1 text-sm text-gray-900">{exam?.description}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Instructions</h3>
          <p className="mt-1 text-sm text-gray-900">{exam?.instructions}</p>
        </div>

        {exam?.questions && exam.questions.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-4">Questions</h3>
            <div className="space-y-4">
              {exam.questions.map((question, index) => (
                <div key={question._id} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">
                    {index + 1}. {question.question}
                  </p>
                  {question.options && (
                    <div className="mt-2 space-y-2 ml-6">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center">
                          <span className="text-sm text-gray-700">
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ExamDetail.propTypes = {
  examId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ExamDetail;