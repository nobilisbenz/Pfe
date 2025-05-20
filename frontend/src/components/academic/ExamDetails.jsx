import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { academicService } from '../../services/academic.service';
import QuestionList from './QuestionList';

const ExamDetails = ({ examId }) => {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await academicService.getExamById(examId);
        setExam(response.data);
      } catch (err) {
        setError(err.message || 'Erreur lors de la récupération des détails de l\'examen');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

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

  if (!exam) {
    return (
      <div className="text-center py-4 text-gray-500">
        Examen non trouvé
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {exam.name}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Matière</p>
            <p className="font-medium">{exam.subject}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Programme</p>
            <p className="font-medium">{exam.program}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">
              {new Date(exam.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Durée</p>
            <p className="font-medium">{exam.duration} minutes</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Points totaux</p>
            <p className="font-medium">{exam.totalMarks}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className={`font-medium ${
              exam.status === 'published' 
                ? 'text-green-600' 
                : exam.status === 'draft' 
                  ? 'text-yellow-600' 
                  : 'text-gray-600'
            }`}>
              {exam.status === 'published' ? 'Publié' : 
               exam.status === 'draft' ? 'Brouillon' : 
               'Terminé'}
            </p>
          </div>
        </div>

        {exam.description && (
          <div className="mt-6">
            <p className="text-sm text-gray-500">Description</p>
            <p className="mt-1">{exam.description}</p>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <QuestionList examId={examId} />
      </div>
    </div>
  );
};

ExamDetails.propTypes = {
  examId: PropTypes.string.isRequired
};

export default ExamDetails;