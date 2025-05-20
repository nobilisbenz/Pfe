
const Contact = () => {
  const contactInfo = [
    { icon: '📍', title: 'Adresse', content: '123 Rue de la Formation, 75000 Paris' },
    { icon: '📞', title: 'Téléphone', content: '+33 1 23 45 67 89' },
    { icon: '📧', title: 'Email', content: 'contact@efgb.fr' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique d'envoi du formulaire
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-12">Contactez-nous</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Formulaire de contact */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      Prénom
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="input-field mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Nom
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="input-field mt-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="input-field mt-1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Sujet
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="input-field mt-1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    className="input-field mt-1"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary w-full">
                  Envoyer le message
                </button>
              </form>
            </div>

            {/* Informations de contact */}
            <div className="space-y-8">
              {contactInfo.map((info, index) => (
                <div key={index} className="card flex items-start space-x-4">
                  <div className="text-3xl">{info.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{info.title}</h3>
                    <p className="text-gray-600">{info.content}</p>
                  </div>
                </div>
              ))}

              {/* Carte Google Maps */}
              <div className="card h-64 bg-gray-200">
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Carte Google Maps ici
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact; 