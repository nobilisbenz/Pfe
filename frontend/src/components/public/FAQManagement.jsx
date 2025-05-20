import { useState, useEffect } from 'react';
import { faqService } from '../../services/faq.service';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const FAQManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'Admission',
    ordre: 0,
    isActive: true
  });

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Tentative de chargement des FAQs...');
      const response = await faqService.getAllFAQs();
      console.log('Réponse du serveur:', response);
      if (response.status === "success") {
        setFaqs(response.data);
      } else {
        console.error('Réponse non valide:', response);
        setError("Format de réponse invalide");
      }
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError(err.response?.data?.message || err.message || "Erreur lors du chargement des FAQs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedFAQ) {
        await faqService.updateFAQ(selectedFAQ._id, formData);
      } else {
        await faqService.createFAQ(formData);
      }
      setIsModalOpen(false);
      setSelectedFAQ(null);
      setFormData({
        question: '',
        answer: '',
        category: 'Admission',
        ordre: 0,
        isActive: true
      });
      await loadFAQs();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement de la FAQ");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (faq) => {
    setSelectedFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      ordre: faq.ordre,
      isActive: faq.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette FAQ ?')) {
      try {
        await faqService.deleteFAQ(id);
        await loadFAQs();
      } catch (err) {
        setError(err.message || "Erreur lors de la suppression de la FAQ");
      }
    }
  };

  if (loading && !faqs.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Gestion des FAQs</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-mandarine-500 text-white rounded-lg hover:bg-mandarine-600"
        >
          Ajouter une FAQ
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {faqs.map((faq) => (
          <div key={faq._id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">{faq.question}</h3>
                <p className="text-gray-600 mt-2">{faq.answer}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-500">
                    Catégorie: {faq.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    Ordre: {faq.ordre}
                  </span>
                  <span className={`text-sm ${faq.isActive ? 'text-green-500' : 'text-red-500'}`}>
                    {faq.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(faq)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                >
                  <FiEdit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(faq._id)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-semibold mb-4">
              {selectedFAQ ? 'Modifier la FAQ' : 'Ajouter une FAQ'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Réponse
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Admission">Admission</option>
                  <option value="Formation">Formation</option>
                  <option value="Financement">Financement</option>
                  <option value="Général">Général</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  value={formData.ordre}
                  onChange={(e) => setFormData({ ...formData, ordre: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Actif</label>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedFAQ(null);
                    setFormData({
                      question: '',
                      answer: '',
                      category: 'Admission',
                      ordre: 0,
                      isActive: true
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedFAQ ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQManagement;