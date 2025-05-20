import { useState, useEffect } from 'react';
import { academicService } from '../../services/academic.service';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const AcademicYearList = () => {
    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadAcademicYears();
    }, []);

    const loadAcademicYears = async () => {
        try {
            const response = await academicService.getAcademicYears();
            setAcademicYears(response.data);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des années académiques');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette année académique ?')) {
            try {
                await academicService.deleteAcademicYear(id);
                setAcademicYears(academicYears.filter(year => year._id !== id));
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
                            Date de création
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {academicYears.map((year) => (
                        <tr key={year._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {year.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {new Date(year.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => handleEdit(year._id)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(year._id)}
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

export default AcademicYearList;