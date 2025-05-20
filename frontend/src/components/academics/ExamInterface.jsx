import { useState } from 'react';
import ExamManagement from './ExamManagement';
import QuestionManagement from './QuestionManagement';
import ExamResultsManagement from './ExamResultsManagement';
import { FiEdit3, FiList, FiCheckSquare } from 'react-icons/fi';

const ExamInterface = () => {
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [activeTab, setActiveTab] = useState('exams'); // 'exams', 'questions', 'results'

  const handleExamSelect = (examId) => {
    setSelectedExamId(examId);
    setActiveTab('questions');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('exams')}
              className={`${
                activeTab === 'exams'
                  ? 'border-mandarine-500 text-mandarine-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium flex items-center`}
            >
              <FiList className="mr-2" />
              Examens
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              disabled={!selectedExamId}
              className={`${
                !selectedExamId
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : activeTab === 'questions'
                  ? 'border-mandarine-500 text-mandarine-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium flex items-center`}
            >
              <FiEdit3 className="mr-2" />
              Questions
            </button>
            <button
              onClick={() => setActiveTab('results')}
              disabled={!selectedExamId}
              className={`${
                !selectedExamId
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : activeTab === 'results'
                  ? 'border-mandarine-500 text-mandarine-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium flex items-center`}
            >
              <FiCheckSquare className="mr-2" />
              Résultats
            </button>
          </nav>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'exams' && (
          <ExamManagement onExamSelect={handleExamSelect} />
        )}
        {activeTab === 'questions' && selectedExamId && (
          <QuestionManagement examId={selectedExamId} />
        )}
        {activeTab === 'results' && selectedExamId && (
          <ExamResultsManagement examId={selectedExamId} />
        )}
      </div>
    </div>
  );
};

export default ExamInterface;