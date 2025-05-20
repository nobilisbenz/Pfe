import { useState, useEffect } from 'react';
import { academicService } from '../../services/academic.service';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

const ProgramList = ({ onEdit, onAddSubject }) => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadPrograms();
    }, []);

    const loadPrograms = async () => {
        try {
            const response = await academicService.getPrograms();
            setPrograms(response.data);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des programmes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce programme ?')) {
            try {
                await academicService.deleteProgram(id);
                setPrograms(programs.filter(program => program._id !== id));
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
                            Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Durée
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {programs.map((program) => (
                        <tr key={program._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {program.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {program.code}
                            </td>
                            <td className="px-6 py-4">
                                {program.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {program.duration}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => onEdit(program)}
                                        className="text-blue-600 hover:text-blue-800"
                                        title="Modifier"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(program._id)}
                                        className="text-red-600 hover:text-red-800"
                                        title="Supprimer"
                                    >
                                        <FiTrash2 />
                                    </button>
                                    <button 
                                        onClick={() => onAddSubject(program)}
                                        className="text-green-600 hover:text-green-800"
                                        title="Ajouter une matière"
                                    >
                                        <FiPlus />
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

export default ProgramList;