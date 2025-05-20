import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { academicService } from '../../services/academic.service';

const QuestionForm = ({ examId, question, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    explanation: '',
    marks: 1,
    difficultyLevel: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (question) {
      setFormData({
        question: question.question || '',
        optionA: question.optionA || '',
        optionB: question.optionB || '',
        optionC: question.optionC || '',
        optionD: question.optionD || '',
        correctAnswer: question.correctAnswer || 'A',
        explanation: question.explanation || '',
        marks: question.marks || 1,
        difficultyLevel: question.difficultyLevel || 'medium'
      });
    }
  }, [question]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (question) {
        await academicService.updateQuestion(question._id, formData);
      } else {
        await academicService.createQuestion(examId, formData);
      }
      onSubmit();
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">
        {question ? 'Modifier la question' : 'Ajouter une nouvelle question'}
      </h3>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700">
            Question
          </label>
          <textarea
            id="question"
            name="question"
            rows={3}
            required
            value={formData.question}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['A', 'B', 'C', 'D'].map(option => (
            <div key={option}>
              <label htmlFor={`option${option}`} className="block text-sm font-medium text-gray-700">
                Option {option}
              </label>
              <input
                type="text"
                id={`option${option}`}
                name={`option${option}`}
                required
                value={formData[`option${option}`]}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-700">
              Réponse correcte
            </label>
            <select
              id="correctAnswer"
              name="correctAnswer"
              value={formData.correctAnswer}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {['A', 'B', 'C', 'D'].map(option => (
                <option key={option} value={option}>Option {option}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="marks" className="block text-sm font-medium text-gray-700">
              Points
            </label>
            <input
              type="number"
              id="marks"
              name="marks"
              min="1"
              required
              value={formData.marks}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700">
              Niveau de difficulté
            </label>
            <select
              id="difficultyLevel"
              name="difficultyLevel"
              value={formData.difficultyLevel}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="easy">Facile</option>
              <option value="medium">Moyen</option>
              <option value="hard">Difficile</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="explanation" className="block text-sm font-medium text-gray-700">
            Explication (optionnelle)
          </label>
          <textarea
            id="explanation"
            name="explanation"
            rows={2}
            value={formData.explanation}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : question ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
};

QuestionForm.propTypes = {
  examId: PropTypes.string.isRequired,
  question: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default QuestionForm;