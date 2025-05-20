import { useState, useEffect } from 'react';
import { academicService } from '../../services/academic.service';

const ProgramForm = ({ program = null, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: '4 years'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (program) {
            setFormData({
                name: program.name,
                description: program.description,
                duration: program.duration
            });
        }
    }, [program]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (program) {
                await academicService.updateProgram(program._id, formData);
            } else {
                await academicService.createProgram(formData);
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
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {program ? 'Modifier le programme' : 'Ajouter un programme'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Nom du programme</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Ex: Licence en Informatique"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Durée</label>
                        <select
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm shadow-sm
                                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="1 year">1 an</option>
                            <option value="2 years">2 ans</option>
                            <option value="3 years">3 ans</option>
                            <option value="4 years">4 ans</option>
                            <option value="5 years">5 ans</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Description détaillée du programme..."
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>
                    )}

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-300 rounded-md
                                hover:bg-gray-100 transition-colors duration-200"
                            disabled={loading}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md
                                hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Enregistrement...' : program ? 'Modifier' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProgramForm;