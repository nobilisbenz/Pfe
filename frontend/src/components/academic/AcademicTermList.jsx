import { useState, useEffect } from 'react';
import { academicService } from '../../services/academic.service';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const AcademicTermList = ({ onEdit }) => {
    const [terms, setTerms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadAcademicTerms();
    }, []);

    const loadAcademicTerms = async () => {
        try {
            const response = await academicService.getAcademicTerms();
            setTerms(response.data);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des semestres');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce semestre ?')) {
            try {
                await academicService.deleteAcademicTerm(id);
                setTerms(terms.filter(term => term._id !== id));
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
                            Année académique
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {terms.map((term) => (
                        <tr key={term._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {term.name}
                            </td>
                            <td className="px-6 py-4">
                                {term.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {term.academicYear}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => onEdit(term)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(term._id)}
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

export default AcademicTermList;