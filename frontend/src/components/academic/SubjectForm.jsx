import { useState, useEffect } from 'react';
import { academicService } from '../../services/academic.service';

const SubjectForm = ({ subject = null, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        academicTerm: ''
    });
    const [academicTerms, setAcademicTerms] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadAcademicTerms();
        if (subject) {
            setFormData({
                name: subject.name,
                description: subject.description,
                academicTerm: subject.academicTerm
            });
        }
    }, [subject]);

    const loadAcademicTerms = async () => {
        try {
            const response = await academicService.getAcademicTerms();
            setAcademicTerms(response.data);
        } catch (err) {
            setError('Erreur lors du chargement des semestres');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (subject) {
                await academicService.updateSubject(subject._id, formData);
            } else {
                await academicService.createSubject(formData);
            }
            onSubmit();
        } catch (err) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nom de la matière</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Ex: Mathématiques"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Semestre</label>
                <select
                    name="academicTerm"
                    value={formData.academicTerm}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="">Sélectionner un semestre</option>
                    {academicTerms.map(term => (
                        <option key={term._id} value={term._id}>
                            {term.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Description détaillée de la matière..."
                />
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
                    {loading ? 'Enregistrement...' : subject ? 'Modifier' : 'Créer'}
                </button>
            </div>
        </form>
    );
};

export default SubjectForm;