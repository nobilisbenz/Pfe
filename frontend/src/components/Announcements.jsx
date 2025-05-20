const Announcements = () => {
  const announcements = [
    {
      id: 1,
      title: 'Nouveau cours disponible',
      content: 'Le cours de React avancé est maintenant disponible sur la plateforme.',
      date: '2024-03-15',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Fermeture pour les fêtes',
      content: 'L\'école sera fermée du 24 décembre au 2 janvier.',
      date: '2024-03-14',
      priority: 'medium',
    },
    {
      id: 3,
      title: 'Mise à jour de la plateforme',
      content: 'Une nouvelle version de la plateforme sera déployée ce weekend.',
      date: '2024-03-13',
      priority: 'low',
    },
  ];

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'medium':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-4 border-blue-500 bg-blue-50';
      default:
        return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">Annonces</h2>
      <div className="space-y-6">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className={`card ${getPriorityStyles(announcement.priority)} transform hover:-translate-y-1 transition-all duration-200`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{announcement.title}</h3>
              <span className="text-sm text-gray-500">
                {new Date(announcement.date).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <p className="text-gray-600">{announcement.content}</p>
            <div className="mt-4 flex justify-end">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                Lire plus →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;