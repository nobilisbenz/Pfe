const Resources = () => {
  const resources = [
    {
      id: 1,
      title: 'Cours React',
      type: 'video',
      description: 'Série de vidéos sur les fondamentaux de React',
      icon: '🎥',
      downloadLink: '#',
    },
    {
      id: 2,
      title: 'Documentation JavaScript',
      type: 'pdf',
      description: 'Guide complet du développement JavaScript moderne',
      icon: '📄',
      downloadLink: '#',
    },
    {
      id: 3,
      title: 'Exercices pratiques',
      type: 'exercises',
      description: 'Collection d\'exercices pour pratiquer',
      icon: '✏️',
      downloadLink: '#',
    },
    {
      id: 4,
      title: 'Projets exemple',
      type: 'github',
      description: 'Référentiels GitHub avec des projets exemple',
      icon: '💻',
      downloadLink: '#',
    },
  ];

  const categories = [
    { name: 'Tous', value: 'all' },
    { name: 'Vidéos', value: 'video' },
    { name: 'Documents', value: 'pdf' },
    { name: 'Exercices', value: 'exercises' },
    { name: 'Code', value: 'github' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">Ressources pédagogiques</h2>
      
      {/* Filtres */}
      <div className="flex flex-wrap gap-4 mb-8">
        {categories.map((category) => (
          <button
            key={category.value}
            className="px-4 py-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow duration-200 text-gray-700 hover:text-blue-600"
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Grille de ressources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <div key={resource.id} className="card hover:shadow-lg transition-all duration-200">
            <div className="flex items-start">
              <div className="text-3xl mr-4">{resource.icon}</div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                <a
                  href={resource.downloadLink}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  Télécharger
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resources;