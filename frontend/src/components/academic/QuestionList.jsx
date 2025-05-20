import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { academicService } from '../../services/academic.service';
import QuestionForm from './QuestionForm';

const QuestionList = ({ examId }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const fetchQuestions = async () => {
    try {
      const response = await academicService.getExamQuestions(examId);
      setQuestions(response.data);
    } catch (err) {
      setError(err.message || 'Erreur lors de la récupération des questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [examId]);

  const handleAddQuestion = () => {
    setSelectedQuestion(null);
    setShowForm(true);
  };

  const handleEditQuestion = (question) => {
    setSelectedQuestion(question);
    setShowForm(true);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      try {
        await academicService.deleteQuestion(questionId);
        fetchQuestions();
      } catch (err) {
        setError(err.message || 'Erreur lors de la suppression de la question');
      }
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    fetchQuestions();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedQuestion(null);
  };

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Questions de l'examen
        </h3>
        <button
          onClick={handleAddQuestion}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiPlus className="w-5 h-5 inline-block mr-2" />
          Ajouter une question
        </button>
      </div>

      {showForm && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <QuestionForm
            examId={examId}
            question={selectedQuestion}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {questions.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          Aucune question n'a encore été ajoutée à cet examen.
        </p>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div
              key={question._id}
              className="p-4 bg-white shadow rounded-lg space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <h4 className="font-medium text-gray-900">
                    Question {index + 1} ({question.marks} points)
                  </h4>
                  <p className="mt-1 text-gray-600">{question.question}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditQuestion(question)}
                    className="p-2 text-blue-600 hover:text-blue-800"
                  >
                    <FiEdit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(question._id)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-1">
                  <p className={`text-sm ${question.correctAnswer === 'A' ? 'font-medium text-green-600' : ''}`}>
                    A: {question.optionA}
                  </p>
                  <p className={`text-sm ${question.correctAnswer === 'B' ? 'font-medium text-green-600' : ''}`}>
                    B: {question.optionB}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className={`text-sm ${question.correctAnswer === 'C' ? 'font-medium text-green-600' : ''}`}>
                    C: {question.optionC}
                  </p>
                  <p className={`text-sm ${question.correctAnswer === 'D' ? 'font-medium text-green-600' : ''}`}>
                    D: {question.optionD}
                  </p>
                </div>
              </div>

              {question.explanation && (
                <div className="mt-2 text-sm text-gray-500">
                  <p className="font-medium">Explication:</p>
                  <p>{question.explanation}</p>
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Niveau: {question.difficultyLevel}</span>
                <span>Réponse correcte: {question.correctAnswer}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

QuestionList.propTypes = {
  examId: PropTypes.string.isRequired
};

export default QuestionList;