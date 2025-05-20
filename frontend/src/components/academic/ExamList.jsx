import { useState, useEffect } from 'react';
import { academicService } from '../../services/academic.service';
import { FiEdit2, FiTrash2, FiEye, FiCheck, FiX } from 'react-icons/fi';

const ExamList = ({ onEdit, onView }) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadExams();
    }, []);

    const loadExams = async () => {
        try {
            const response = await academicService.getExams();
            setExams(response.data);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des examens');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
            try {
                await academicService.deleteExam(id);
                setExams(exams.filter(exam => exam._id !== id));
            } catch (err) {
                setError(err.message || 'Erreur lors de la suppression');
            }
        }
    };

    const handlePublishResults = async (examId, isPublished) => {
        try {
            if (isPublished) {
                await academicService.unpublishExamResults(examId);
            } else {
                await academicService.publishExamResults(examId);
            }
            loadExams(); // Recharger la liste pour mettre à jour le statut
        } catch (err) {
            setError(err.message || 'Erreur lors de la modification du statut');
        }
    };

    if (loading) return <div>Chargement...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nom
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Matière
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Durée
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {exams.map((exam) => (
                        <tr key={exam._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {exam.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {exam.subject}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {new Date(exam.examDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {exam.duration} minutes
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${exam.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                                >
                                    {exam.isPublished ? 'Publié' : 'Non publié'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => onView(exam)}
                                        className="text-blue-600 hover:text-blue-800"
                                        title="Voir les détails"
                                    >
                                        <FiEye />
                                    </button>
                                    <button 
                                        onClick={() => onEdit(exam)}
                                        className="text-blue-600 hover:text-blue-800"
                                        title="Modifier"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(exam._id)}
                                        className="text-red-600 hover:text-red-800"
                                        title="Supprimer"
                                    >
                                        <FiTrash2 />
                                    </button>
                                    <button 
                                        onClick={() => handlePublishResults(exam._id, exam.isPublished)}
                                        className={`${exam.isPublished ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                                        title={exam.isPublished ? 'Dépublier les résultats' : 'Publier les résultats'}
                                    >
                                        {exam.isPublished ? <FiX /> : <FiCheck />}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ExamList;