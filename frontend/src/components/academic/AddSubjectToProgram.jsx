import { useState, useEffect } from 'react';
import { academicService } from '../../services/academic.service';

const AddSubjectToProgram = ({ program, onSubmit, onCancel }) => {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            const response = await academicService.getSubjects();
            setSubjects(response.data);
        } catch (err) {
            setError('Erreur lors du chargement des matières');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSubject) {
            setError('Veuillez sélectionner une matière');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await academicService.addSubjectToProgram(program._id, {
                name: selectedSubject
            });
            onSubmit();
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'ajout de la matière');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Ajouter une matière à {program.name}
                </h3>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Sélectionner une matière
                    </label>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">Choisir une matière</option>
                        {subjects.map(subject => (
                            <option key={subject._id} value={subject.name}>
                                {subject.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={loading}
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Ajout en cours...' : 'Ajouter'}
                </button>
            </div>
        </form>
    );
};

export default AddSubjectToProgram;