import { useState, useEffect } from 'react';
import { academicService } from '../../services/academic.service';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const ClassLevelList = ({ onEdit }) => {
    const [classLevels, setClassLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadClassLevels();
    }, []);

    const loadClassLevels = async () => {
        try {
            const response = await academicService.getClassLevels();
            setClassLevels(response.data);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des niveaux');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce niveau ?')) {
            try {
                await academicService.deleteClassLevel(id);
                setClassLevels(classLevels.filter(level => level._id !== id));
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
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {classLevels.map((level) => (
                        <tr key={level._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {level.name}
                            </td>
                            <td className="px-6 py-4">
                                {level.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => onEdit(level)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(level._id)}
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

export default ClassLevelList;