
const About = () => {
  const stats = [
    { value: '1000+', label: 'Étudiants formés' },
    { value: '50+', label: 'Formateurs experts' },
    { value: '95%', label: 'Taux de réussite' },
    { value: '80%', label: 'Taux d\'insertion' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Section Hero */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              À Propos de EFGB
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Centre d&apos;excellence en formation professionnelle
            </p>
          </div>
        </div>

        {/* Section Notre Histoire */}
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Notre Histoire</h2>
            <p className="text-gray-600 mb-8">
              Depuis notre création en 2010, EFGB s&apos;est engagé à fournir une formation 
              de qualité dans le domaine du numérique. Notre mission est de former 
              les talents de demain et de les accompagner vers la réussite professionnelle.
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Valeurs */}
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Nos Valeurs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-4">Excellence</h3>
                <p className="text-gray-600">
                  Nous visons l&apos;excellence dans tous nos programmes de formation.
                </p>
              </div>
              <div className="card text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-bold mb-4">Innovation</h3>
                <p className="text-gray-600">
                  Nous adoptons les dernières technologies et méthodes pédagogiques.
                </p>
              </div>
              <div className="card text-center">
                <div className="text-4xl mb-4">💡</div>
                <h3 className="text-xl font-bold mb-4">Accompagnement</h3>
                <p className="text-gray-600">
                  Nous accompagnons chaque étudiant vers sa réussite professionnelle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About; 