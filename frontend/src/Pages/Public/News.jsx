import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { newsService } from '../../services/news.service';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const News = () => {
  const { darkMode } = useTheme();
  const [news, setNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();

  const categories = ['Formation', 'Événement', 'Annonce', 'Actualité'];

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        if (id) {
          const response = await newsService.getNews(id);
          if (response.status === "success") {
            setNews([response.data]);
          }
        } else {
          const response = await newsService.getAllNews();
          if (response.status === "success") {
            setNews(response.data);
          }
        }
      } catch (err) {
        setError("Erreur lors du chargement des actualités");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [id]);

  const filteredNews = selectedCategory
    ? news.filter(item => item.category === selectedCategory)
    : news;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow py-12 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <motion.div className="container mx-auto px-4">
          <motion.h1 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Actualités
          </motion.h1>

          {/* Filtres par catégorie */}
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full ${
                !selectedCategory
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tout
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Grille d'actualités */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((item) => (
              <motion.article
                key={item._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg 
                         transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl">{item.image}</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      item.category === 'Formation' ? 'bg-blue-100 text-blue-800' :
                      item.category === 'Événement' ? 'bg-green-100 text-green-800' :
                      item.category === 'Annonce' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {item.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {item.title}
                  </h2>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {item.readTime} de lecture
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {item.summary}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(item.createdAt), 'dd MMMM yyyy', { locale: fr })}
                    </span>
                    {!id && (
                      <Link
                        to={`/news/${item._id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 
                                 dark:hover:text-blue-300 font-semibold flex items-center"
                      >
                        Lire la suite
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
                {id && (
                  <div className="px-6 pb-6">
                    <div className="mt-4 prose max-w-none">
                      {item.content}
                    </div>
                    <Link
                      to="/news"
                      className="inline-block mt-6 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      ← Retour aux actualités
                    </Link>
                  </div>
                )}
              </motion.article>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default News;