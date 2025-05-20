import { useState, useEffect } from 'react';
import { academicService } from '../../services/academic.service';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const SubjectList = ({ onEdit }) => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            const response = await academicService.getSubjects();
            setSubjects(response.data);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des matières');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) {
            try {
                await academicService.deleteSubject(id);
                setSubjects(subjects.filter(subject => subject._id !== id));
            } catch (err) {
                setError(err.message || 'Erreur lors de la suppression');
            }
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
                            Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Semestre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {subjects.map((subject) => (
                        <tr key={subject._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {subject.name}
                            </td>
                            <td className="px-6 py-4">
                                {subject.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {subject.academicTerm}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => onEdit(subject)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(subject._id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <FiTrash2 />
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

export default SubjectList;