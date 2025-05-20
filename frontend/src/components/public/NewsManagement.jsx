import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { newsService } from '../../services/news.service';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: '',
    image: '📰',
    isPublished: true
  });

  const categories = ['Formation', 'Événement', 'Annonce', 'Actualité'];

  const loadNews = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await newsService.getAllNews();
      if (response.status === "success") {
        setNews(response.data);
      } else {
        setError(response.message || "Une erreur est survenue lors du chargement des actualités");
      }
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError(err.response?.data?.message || err.message || "Erreur lors du chargement des actualités");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedNews) {
        await newsService.updateNews(selectedNews._id, formData);
      } else {
        await newsService.createNews(formData);
      }
      await loadNews();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) {
      try {
        setLoading(true);
        await newsService.deleteNews(id);
        await loadNews();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (newsItem) => {
    setSelectedNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      summary: newsItem.summary,
      category: newsItem.category,
      image: newsItem.image,
      isPublished: newsItem.isPublished
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
    setFormData({
      title: '',
      content: '',
      summary: '',
      category: '',
      image: '📰',
      isPublished: true
    });
  };

  if (loading && !news.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mandarine-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Gestion des Actualités</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-mandarine-500 text-white rounded-lg hover:bg-mandarine-600"
        >
          <FiPlus className="mr-2" /> Ajouter une actualité
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="text-4xl">{item.image}</div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                item.category === 'Formation' ? 'bg-blue-100 text-blue-800' :
                item.category === 'Événement' ? 'bg-green-100 text-green-800' :
                item.category === 'Annonce' ? 'bg-yellow-100 text-yellow-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {item.category}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
            <p className="text-gray-600 mb-4">{item.summary}</p>
            <div className="flex justify-between items-end">
              <span className="text-sm text-gray-500">
                {format(new Date(item.createdAt), 'dd MMMM yyyy', { locale: fr })}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">
              {selectedNews ? 'Modifier l\'actualité' : 'Nouvelle actualité'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Titre</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-mandarine-500 focus:ring-mandarine-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Résumé</label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-mandarine-500 focus:ring-mandarine-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contenu</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-mandarine-500 focus:ring-mandarine-500"
                  required
                  rows={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-mandarine-500 focus:ring-mandarine-500"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Icône</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-mandarine-500 focus:ring-mandarine-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                  className="h-4 w-4 text-mandarine-600 focus:ring-mandarine-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                  Publier l'actualité
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-mandarine-500 text-white rounded-md hover:bg-mandarine-600"
                  disabled={loading}
                >
                  {loading ? 'Chargement...' : selectedNews ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManagement;